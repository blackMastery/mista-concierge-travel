"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

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
  travelDate?: string;
  travelers: number;
  insurance: boolean;
  totalCents: number;
};

export async function createBookingRequest(
  input: BookingInput,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("booking_requests").insert({
    tour_id: input.tourId,
    user_id: user?.id ?? null,
    travel_date: input.travelDate || null,
    travelers: input.travelers,
    insurance: input.insurance,
    total_cents: input.totalCents,
    contact_email: user?.email ?? null,
  });
  if (error) return { ok: false, error: "Could not submit your request." };
  if (user) revalidatePath("/account");
  return { ok: true };
}
