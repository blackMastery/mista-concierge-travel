// Format integer cents as a dollar price string, e.g. 298000 -> "$2,980".
export function formatPrice(cents: number): string {
  return "$" + Math.round(cents / 100).toLocaleString("en-US");
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
