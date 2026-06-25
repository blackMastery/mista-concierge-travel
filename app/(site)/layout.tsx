import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { getSiteContent } from "@/lib/queries";
import type { PromoBannerContent } from "@/lib/format";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  const promo = content.promo_banner as PromoBannerContent | undefined;

  return (
    <>
      {promo && <PromoBanner content={promo} />}
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
