"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";
import { isValidEmail } from "@/lib/validation";
import { contactSchema, newsletterEmailSchema, bookingSchema } from "@/lib/schemas";
import { getBookingPricingContext } from "@/lib/queries";
import {
  computeBookingTotalCents,
  computePeopleCount,
  buildPricingBreakdown,
  selectionFitsPricing,
  type BookingSelection,
} from "@/lib/pricing";
import {
  sendBookingEmail,
  sendBookingAdminEmail,
} from "@/lib/email";

function firstZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Please check your details and try again.";
}

export type ActionResult = { ok: boolean; error?: string; referenceCode?: string };

function generateBookingReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MC-${suffix}`;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/account");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Favorites (auth required)
// ---------------------------------------------------------------------------
export async function toggleFavorite(
  tourId: string,
): Promise<{ ok: boolean; favorited: boolean; needsAuth?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, favorited: false, needsAuth: true };

  const { data: existing } = await supabase
    .from("favorites")
    .select("tour_id")
    .eq("user_id", user.id)
    .eq("tour_id", tourId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("tour_id", tourId);
    if (error) return { ok: false, favorited: true, error: error.message };
    revalidatePath("/account");
    return { ok: true, favorited: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, tour_id: tourId });
  if (error) return { ok: false, favorited: false, error: error.message };
  revalidatePath("/account");
  return { ok: true, favorited: true };
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------
export async function subscribeNewsletter(email: string): Promise<ActionResult> {
  const parsed = newsletterEmailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const clean = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: clean });
  // Unique-violation means already subscribed — treat as success.
  if (error && error.code !== "23505") {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
};

export async function submitContact(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }
  const { name, email, phone, interest, message } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone: phone || null,
    interest: interest || null,
    message,
  });
  if (error) return { ok: false, error: "Could not send your message." };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Booking request
// ---------------------------------------------------------------------------
// The client sends the customer's *selection*, never a price. The server
// recomputes the authoritative total from the tour's stored pricing.
export type BookingInput = {
  tourId: string;
  travelDate: string;
  occupancyIndex: number | null;
  childCounts: number[];
  travelers: number;
  insurance: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
};

export type BookingStatusResult = {
  ok: boolean;
  error?: string;
  booking?: {
    reference_code: string;
    tour_title: string;
    tour_slug: string;
    travel_date: string | null;
    travelers: number;
    total_cents: number;
    status: string;
    pricing_breakdown: Json | null;
    created_at: string;
  };
};

export async function createBookingRequest(
  input: BookingInput,
): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }
  const data = parsed.data;

  const contactName = data.contactName;
  const contactEmail = data.contactEmail.toLowerCase();
  const contactPhone = data.contactPhone;
  const travelDate = data.travelDate;
  const specialRequests = data.specialRequests || null;

  const todayISO = new Date().toISOString().slice(0, 10);
  if (travelDate < todayISO) {
    return { ok: false, error: "Travel date must be today or later." };
  }

  // Load the tour's authoritative pricing and recompute the total server-side.
  // The browser never gets to set the price.
  const ctx = await getBookingPricingContext(data.tourId);
  if (!ctx) {
    return { ok: false, error: "This tour is not available for booking." };
  }

  const selection: BookingSelection = {
    occupancyIndex: data.occupancyIndex,
    childCounts: data.childCounts,
    travelers: data.travelers,
  };
  if (!selectionFitsPricing(ctx.pricing, selection)) {
    return { ok: false, error: "Please review your selection and try again." };
  }

  const people = computePeopleCount(ctx.pricing, selection);
  if (people < 1) {
    return { ok: false, error: "Please select at least one traveler." };
  }

  const totalCents = computeBookingTotalCents(
    ctx.pricing,
    ctx.basePriceCents,
    selection,
  );
  const pricingBreakdown = buildPricingBreakdown(
    ctx.pricing,
    ctx.basePriceCents,
    ctx.paymentTerms,
    ctx.depositOpen,
    selection,
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let resolvedName = contactName;
  if (user && !resolvedName) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    resolvedName = (profile as { full_name: string | null } | null)?.full_name?.trim() || contactName;
  }

  const insertPayload = {
    tour_id: data.tourId,
    user_id: user?.id ?? null,
    travel_date: travelDate,
    travelers: people,
    insurance: data.insurance,
    total_cents: totalCents,
    pricing_breakdown: pricingBreakdown as Json,
    contact_name: resolvedName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    special_requests: specialRequests,
  };

  // Guest inserts cannot use `.select()` — RLS only allows select when
  // auth.uid() = user_id, and null = null is not true for anonymous users.
  let referenceCode = "";
  let bookingId: string | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    referenceCode = generateBookingReference();
    const row = { ...insertPayload, reference_code: referenceCode };

    if (user) {
      const { data, error } = await supabase
        .from("booking_requests")
        .insert(row)
        .select("id, reference_code")
        .single();
      if (!error && data) {
        bookingId = (data as { id: string; reference_code: string }).id;
        referenceCode = (data as { id: string; reference_code: string }).reference_code;
        break;
      }
      if (error?.code === "23505") continue;
      console.error("[booking] insert failed:", error?.message);
      return { ok: false, error: "Could not submit your request." };
    }

    const { error } = await supabase.from("booking_requests").insert(row);
    if (!error) break;
    if (error.code === "23505") continue;
    console.error("[booking] insert failed:", error.message);
    return { ok: false, error: "Could not submit your request." };
  }

  if (!referenceCode) {
    return { ok: false, error: "Could not submit your request." };
  }

  void sendBookingEmail({
    bookingId: bookingId ?? undefined,
    referenceCode: bookingId ? undefined : referenceCode,
    slug: "booking_confirmation",
  }).catch((err) => console.error("[booking] email failed:", err));

  void sendBookingAdminEmail({
    bookingId: bookingId ?? undefined,
    referenceCode: bookingId ? undefined : referenceCode,
    slug: "booking_confirmation_admin",
  }).catch((err) => console.error("[booking] admin email failed:", err));

  if (user) revalidatePath("/account");
  return { ok: true, referenceCode };
}

export async function trackBooking(
  reference: string,
  email: string,
): Promise<BookingStatusResult> {
  const ref = reference.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!ref || !isValidEmail(cleanEmail)) {
    return { ok: false, error: "Please enter your reference and email." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_booking_status", {
    p_reference: ref,
    p_email: cleanEmail,
  });

  if (error) {
    return { ok: false, error: "Could not look up your booking." };
  }

  const rows = (data ?? []) as BookingStatusResult["booking"][];
  const booking = rows[0];
  if (!booking) {
    return {
      ok: false,
      error: "No booking found with that reference and email.",
    };
  }

  return { ok: true, booking };
}
