// Format integer cents (GYD × 100) as a price string, e.g. 26500000 -> "$265,000 GYD".
export function formatPrice(cents: number): string {
  return "$" + Math.round(cents / 100).toLocaleString("en-US") + " GYD";
}

// Format an ISO date (YYYY-MM-DD) for display, e.g. "2026-06-15" -> "June 15, 2026".
// Parsed as UTC noon to avoid timezone day-shifts.
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// URL slug from a display name, e.g. "St. Lucia" -> "st-lucia".
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Brand micro-content shapes stored in site_content.value (jsonb).
export type PromoBannerContent = {
  strong: string;
  text: string;
  cta_label: string;
  cta_href: string;
};
export type StatItem = { num: string; label: string };
export type PillarItem = { icon: string; title: string; body: string };
export type CertItem = { big: string; label: string };
