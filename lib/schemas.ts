import { z } from "zod";
import { EMAIL_REGEX } from "@/lib/validation";

// Validation schemas for the public (untrusted) server actions. Mirrors the Zod
// pattern already used in app/admin/email-templates/actions.ts. Unknown keys are
// stripped by default, so a client can never smuggle extra fields (e.g. a
// pre-computed total_cents) into a mutation.

const emailField = z
  .string()
  .trim()
  .regex(EMAIL_REGEX, "Please enter a valid email address.");

export const newsletterEmailSchema = emailField.transform((e) => e.toLowerCase());

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  email: emailField,
  phone: z.string().trim().max(50).optional(),
  interest: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Please add a short message.").max(5000),
});
export type ContactValues = z.infer<typeof contactSchema>;

// The booking input is now a *selection*, never a price. The server recomputes
// the authoritative total from this via lib/pricing.ts.
export const bookingSchema = z.object({
  tourId: z.string().uuid("Invalid tour."),
  travelDate: z.string().trim().min(1, "Please select a travel date."),
  occupancyIndex: z.number().int().min(0).max(50).nullable(),
  childCounts: z.array(z.number().int().min(0).max(50)).max(20),
  travelers: z.number().int().min(0).max(50),
  insurance: z.boolean(),
  contactName: z.string().trim().min(1, "Please enter your name.").max(200),
  contactEmail: emailField,
  contactPhone: z.string().trim().min(1, "Please enter your phone number.").max(50),
  specialRequests: z.string().trim().max(2000).optional(),
});
export type BookingValues = z.infer<typeof bookingSchema>;
