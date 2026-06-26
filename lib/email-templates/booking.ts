import { formatPrice, formatDate } from "@/lib/format";

const SITE_NAME = "Mista Concierge Travel";

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F7F3EA;font-family:Inter,Arial,sans-serif;color:#1A2E28;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EA;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#1B7A5C;padding:24px 28px;">
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#F7F3EA;">${SITE_NAME}</div>
        </td></tr>
        <tr><td style="padding:28px;">${body}</td></tr>
        <tr><td style="padding:0 28px 28px;font-size:12px;color:#7A8A84;line-height:1.5;">
          Questions? Reply to this email or contact hello@mistatravel.com.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#7A8A84;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#1A2E28;font-weight:600;">${value}</td>
  </tr>`;
}

export type BookingEmailDetails = {
  referenceCode: string;
  tourTitle: string;
  travelDate: string;
  travelers: number;
  totalCents: number;
  depositCents?: number;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  specialRequests?: string;
  trackUrl: string;
  adminUrl?: string;
};

export function bookingConfirmationTravelerEmail(d: BookingEmailDetails): {
  subject: string;
  html: string;
} {
  const depositRow =
    d.depositCents && d.depositCents > 0
      ? row("Deposit", formatPrice(d.depositCents))
      : "";

  const body = `
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#1A2E28;">Request received</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3D524C;">
      Hi ${escapeHtml(d.contactName)}, thank you for your booking request. Your concierge will confirm availability and reach out within 24 hours.
    </p>
    <div style="background:#F7F3EA;border-radius:12px;padding:16px 20px;margin-bottom:20px;text-align:center;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#7A8A84;">Booking reference</div>
      <div style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#1B7A5C;margin-top:4px;">${escapeHtml(d.referenceCode)}</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row("Tour", escapeHtml(d.tourTitle))}
      ${row("Travel date", formatDate(d.travelDate))}
      ${row("Travelers", String(d.travelers))}
      ${row("Total", formatPrice(d.totalCents))}
      ${depositRow}
    </table>
    <a href="${escapeHtml(d.trackUrl)}" style="display:inline-block;background:#1B7A5C;color:#F7F3EA;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:600;">Track your booking</a>
    <p style="margin:20px 0 0;font-size:13px;color:#7A8A84;line-height:1.5;">
      Save your reference <strong>${escapeHtml(d.referenceCode)}</strong> — you'll need it with your email to check status.
    </p>`;

  return {
    subject: `Booking request ${d.referenceCode} — ${d.tourTitle}`,
    html: layout("Booking request received", body),
  };
}

export function bookingConfirmationAdminEmail(d: BookingEmailDetails): {
  subject: string;
  html: string;
} {
  const requestsRow = d.specialRequests
    ? row("Special requests", escapeHtml(d.specialRequests))
    : "";

  const body = `
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#1A2E28;">New booking request</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3D524C;">
      A new concierge booking request needs follow-up.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row("Reference", escapeHtml(d.referenceCode))}
      ${row("Tour", escapeHtml(d.tourTitle))}
      ${row("Guest", escapeHtml(d.contactName))}
      ${row("Email", escapeHtml(d.contactEmail))}
      ${d.contactPhone ? row("Phone", escapeHtml(d.contactPhone)) : ""}
      ${row("Travel date", formatDate(d.travelDate))}
      ${row("Travelers", String(d.travelers))}
      ${row("Total", formatPrice(d.totalCents))}
      ${requestsRow}
    </table>
  ${
    d.adminUrl
      ? `<a href="${escapeHtml(d.adminUrl)}" style="display:inline-block;background:#1B7A5C;color:#F7F3EA;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:600;">View in admin</a>`
      : ""
  }`;

  return {
    subject: `[New booking] ${d.referenceCode} — ${d.tourTitle}`,
    html: layout("New booking request", body),
  };
}

export function bookingStatusUpdateEmail(d: {
  referenceCode: string;
  tourTitle: string;
  contactName: string;
  status: "confirmed" | "cancelled";
  trackUrl: string;
}): { subject: string; html: string } {
  const isConfirmed = d.status === "confirmed";
  const headline = isConfirmed ? "Booking confirmed" : "Booking cancelled";
  const message = isConfirmed
    ? "Great news — your concierge has confirmed your booking. They'll be in touch with next steps for deposit and final payment."
    : "Your booking request has been cancelled. If you have questions or would like to rebook, please contact us.";

  const body = `
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#1A2E28;">${headline}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3D524C;">
      Hi ${escapeHtml(d.contactName)}, ${message}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row("Reference", escapeHtml(d.referenceCode))}
      ${row("Tour", escapeHtml(d.tourTitle))}
      ${row("Status", isConfirmed ? "Confirmed" : "Cancelled")}
    </table>
    <a href="${escapeHtml(d.trackUrl)}" style="display:inline-block;background:#1B7A5C;color:#F7F3EA;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:600;">View booking status</a>`;

  return {
    subject: `${headline} — ${d.referenceCode}`,
    html: layout(headline, body),
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
