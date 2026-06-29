"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";
import {
  sendBookingEmail,
  sendBookingAdminEmail,
} from "@/lib/email";

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
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
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
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message) {
    return { ok: false, error: "Please complete the required fields." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone: input.phone?.trim() || null,
    interest: input.interest || null,
    message,
  });
  if (error) return { ok: false, error: "Could not send your message." };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Booking request
// ---------------------------------------------------------------------------
export type BookingInput = {
  tourId: string;
  travelDate: string;
  travelers: number;
  insurance: boolean;
  totalCents: number;
  pricingBreakdown?: unknown;
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
  const contactName = input.contactName.trim();
  const contactEmail = input.contactEmail.trim().toLowerCase();
  const contactPhone = input.contactPhone.trim();
  const travelDate = input.travelDate.trim();
  const specialRequests = input.specialRequests?.trim() || null;

  if (!contactName) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!contactPhone) {
    return { ok: false, error: "Please enter your phone number." };
  }
  if (!travelDate) {
    return { ok: false, error: "Please select a travel date." };
  }
  if (input.travelers < 1) {
    return { ok: false, error: "Please select at least one traveler." };
  }

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
    tour_id: input.tourId,
    user_id: user?.id ?? null,
    travel_date: travelDate,
    travelers: input.travelers,
    insurance: input.insurance,
    total_cents: input.totalCents,
    pricing_breakdown: (input.pricingBreakdown ?? null) as Json,
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
  if (!ref || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
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
