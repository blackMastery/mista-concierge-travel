import { Resend } from "resend";
import {
  bookingConfirmationAdminEmail,
  bookingConfirmationTravelerEmail,
  bookingStatusUpdateEmail,
  type BookingEmailDetails,
} from "@/lib/email-templates/booking";
import { SITE_URL } from "@/lib/seo";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress(): string | null {
  return process.env.BOOKING_FROM_EMAIL?.trim() || null;
}

function adminAddress(): string | null {
  return process.env.BOOKING_ADMIN_EMAIL?.trim() || null;
}

function siteUrl(): string {
  return SITE_URL;
}

export function buildTrackUrl(referenceCode: string): string {
  return `${siteUrl()}/bookings/track?ref=${encodeURIComponent(referenceCode)}`;
}

export function buildAdminBookingUrl(bookingIdOrRef: string): string {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      bookingIdOrRef,
    );
  if (isUuid) {
    return `${siteUrl()}/admin/bookings/${bookingIdOrRef}`;
  }
  return `${siteUrl()}/admin/bookings?q=${encodeURIComponent(bookingIdOrRef)}`;
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  const from = fromAddress();
  if (!resend || !from) {
    console.warn("[email] Skipping send — RESEND_API_KEY or BOOKING_FROM_EMAIL not set");
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) {
    console.error("[email] Send failed:", error);
  }
}

export async function sendBookingConfirmationEmails(
  details: BookingEmailDetails & { bookingId: string },
): Promise<void> {
  const traveler = bookingConfirmationTravelerEmail(details);
  const admin = bookingConfirmationAdminEmail({
    ...details,
    adminUrl: buildAdminBookingUrl(details.bookingId),
  });

  await Promise.all([
    sendEmail({
      to: details.contactEmail,
      subject: traveler.subject,
      html: traveler.html,
    }),
    adminAddress()
      ? sendEmail({
          to: adminAddress()!,
          subject: admin.subject,
          html: admin.html,
        })
      : Promise.resolve(),
  ]);
}

export async function sendBookingStatusEmail(opts: {
  referenceCode: string;
  tourTitle: string;
  contactName: string;
  contactEmail: string;
  status: "confirmed" | "cancelled";
}): Promise<void> {
  if (!opts.contactEmail) return;

  const { subject, html } = bookingStatusUpdateEmail({
    referenceCode: opts.referenceCode,
    tourTitle: opts.tourTitle,
    contactName: opts.contactName,
    status: opts.status,
    trackUrl: buildTrackUrl(opts.referenceCode),
  });

  await sendEmail({
    to: opts.contactEmail,
    subject,
    html,
  });
}
