import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Carousel } from "@/components/tour/Carousel";
import { Itinerary } from "@/components/tour/Itinerary";
import { Gallery } from "@/components/tour/Gallery";
import { BookingWidget } from "@/components/tour/BookingWidget";
import { getTourBySlug, getTourSlugs } from "@/lib/queries";
import { getFavoriteSet } from "@/lib/auth";

export async function generateStaticParams() {
  const slugs = await getTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };
  return { title: tour.title, description: tour.overview ?? undefined };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tour, favs] = await Promise.all([getTourBySlug(slug), getFavoriteSet()]);
  if (!tour) notFound();

  const carouselImages = (
    tour.tour_images.filter((im) => im.in_carousel).map((im) => im.url)
  );
  const heroImages = carouselImages.length ? carouselImages : [tour.card_image_url];
  const galleryImages = tour.tour_images.length
    ? tour.tour_images.map((im) => im.url)
    : [tour.card_image_url];

  const included = tour.tour_inclusions.filter((i) => i.kind === "included");
  const excluded = tour.tour_inclusions.filter((i) => i.kind === "excluded");

  return (
    <div>
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1280px] px-8 pt-[22px] max-[640px]:px-[22px]">
        <div className="font-sans text-[13px] text-muted-light">
          <Link href="/" className="text-muted-light no-underline">Home</Link> ·{" "}
          <Link href="/tours" className="text-muted-light no-underline">Tours</Link> ·{" "}
          <span className="text-green">{tour.title}</span>
        </div>
      </div>

      {/* CAROUSEL */}
      <section className="mx-auto max-w-[1280px] px-8 pt-5 max-[640px]:px-[22px]">
        <Carousel
          images={heroImages}
          tourId={tour.id}
          slug={tour.slug}
          initialFavorite={favs.has(tour.id)}
        />
      </section>

      {/* MAIN GRID */}
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_380px] items-start gap-12 px-8 pb-20 pt-10 max-[920px]:grid-cols-1 max-[640px]:px-[22px]">
        {/* LEFT */}
        <div>
          <span className="font-sans text-[13px] font-semibold uppercase tracking-[1.5px] text-gold">
            ◆ {tour.location}
          </span>
          <h1 className="m-0 mb-3.5 mt-2.5 font-serif text-[40px] font-bold leading-[1.12] text-ink max-[600px]:text-[30px]">
            {tour.title}
          </h1>
          <div className="mb-[30px] flex flex-wrap items-center gap-[18px]">
            <div className="flex items-center gap-2">
              <span className="text-[16px] tracking-[1px] text-gold">★★★★★</span>
              <span className="text-[14px] text-muted">
                <strong className="text-ink">{tour.rating.toFixed(1)}</strong> ·{" "}
                {tour.reviews_count} reviews
              </span>
            </div>
            <span className="h-[18px] w-px bg-[#D9D2C2]" />
            <span className="text-[14px] text-muted">⏱ {tour.duration_label}</span>
            {tour.booked_last_24h ? (
              <>
                <span className="h-[18px] w-px bg-[#D9D2C2]" />
                <span className="rounded-md bg-coral/[0.12] px-3 py-1 font-sans text-[12px] font-semibold text-coral">
                  {tour.booked_last_24h} booked in last 24h
                </span>
              </>
            ) : null}
          </div>

          {/* OVERVIEW */}
          {tour.overview && (
            <>
              <h2 className="m-0 mb-3.5 font-serif text-[26px] font-semibold text-ink">
                Overview
              </h2>
              <p className="m-0 mb-[26px] text-[15.5px] leading-[1.75] text-ink-soft">
                {tour.overview}
              </p>
            </>
          )}

          {/* HIGHLIGHTS */}
          {tour.tour_highlights.length > 0 && (
            <div className="mb-9 rounded-2xl bg-white p-[26px] px-7 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <h3 className="m-0 mb-4 font-sans text-[16px] font-semibold text-ink">
                Trip Highlights
              </h3>
              <div className="grid grid-cols-2 gap-[13px] max-[600px]:grid-cols-1">
                {tour.tour_highlights.map((h) => (
                  <div key={h.id} className="flex items-start gap-[11px]">
                    <span className="mt-px flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-green/[0.12] text-[12px] text-green">
                      ✓
                    </span>
                    <span className="text-[14.5px] leading-[1.5] text-ink-soft">
                      {h.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ITINERARY */}
          {tour.tour_itinerary.length > 0 && (
            <>
              <h2 className="m-0 mb-[18px] font-serif text-[26px] font-semibold text-ink">
                Itinerary
              </h2>
              <Itinerary days={tour.tour_itinerary} />
            </>
          )}

          {/* WHAT'S INCLUDED */}
          {(included.length > 0 || excluded.length > 0) && (
            <>
              <h2 className="m-0 mb-[18px] font-serif text-[26px] font-semibold text-ink">
                What&apos;s Included
              </h2>
              <div className="mb-9 grid grid-cols-2 gap-6 max-[600px]:grid-cols-1">
                <div className="rounded-xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <h4 className="m-0 mb-3.5 font-sans text-[14px] font-semibold text-green">
                    Included
                  </h4>
                  <div className="flex flex-col gap-[11px]">
                    {included.map((i) => (
                      <div key={i.id} className="flex items-center gap-2.5 text-[14px] text-ink-soft">
                        <span className="font-bold text-green">✓</span>
                        {i.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <h4 className="m-0 mb-3.5 font-sans text-[14px] font-semibold text-[#B0524A]">
                    Not Included
                  </h4>
                  <div className="flex flex-col gap-[11px]">
                    {excluded.map((i) => (
                      <div key={i.id} className="flex items-center gap-2.5 text-[14px] text-muted-light">
                        <span className="font-bold text-[#C0857E]">×</span>
                        {i.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* GALLERY */}
          <h2 className="m-0 mb-[18px] font-serif text-[26px] font-semibold text-ink">
            Gallery
          </h2>
          <Gallery images={galleryImages} />

          {/* REVIEWS */}
          {tour.reviews.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="m-0 font-serif text-[26px] font-semibold text-ink">Reviews</h2>
                <div className="flex items-center gap-2.5">
                  <span className="font-serif text-[32px] font-bold text-green">
                    {tour.rating.toFixed(1)}
                  </span>
                  <div>
                    <span className="text-[14px] tracking-[1px] text-gold">★★★★★</span>
                    <div className="text-[12.5px] text-muted-light">
                      {tour.reviews_count} reviews
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {tour.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl bg-white p-[22px] px-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                    <div className="mb-3 flex items-center gap-[13px]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green font-sans text-[15px] font-semibold text-sand">
                        {r.initials}
                      </div>
                      <div className="flex-1">
                        <div className="font-sans text-[14.5px] font-semibold text-ink">
                          {r.author_name}
                        </div>
                        <div className="text-[12px] text-muted-light">{r.review_date}</div>
                      </div>
                      <span className="text-[13px] tracking-[1px] text-gold">★★★★★</span>
                    </div>
                    <p className="m-0 text-[14.5px] leading-[1.65] text-ink-soft">{r.body}</p>
                  </div>
                ))}
              </div>
              <button className="mt-5 rounded-lg border-2 border-gold bg-transparent px-7 py-3 font-sans text-[14px] font-semibold text-green hover:bg-gold hover:text-white">
                See All {tour.reviews_count} Reviews
              </button>
            </>
          )}
        </div>

        {/* RIGHT: BOOKING */}
        <div className="sticky top-24 flex flex-col gap-[18px] max-[920px]:static">
          <BookingWidget
            tourId={tour.id}
            basePriceCents={tour.price_cents}
            spotsLeft={tour.spots_left}
          />
          <div className="rounded-2xl bg-white p-[22px] px-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h4 className="m-0 mb-3.5 font-sans text-[14px] font-semibold text-ink">
              Questions? Talk to us
            </h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+12460000000" className="flex items-center gap-3 text-[14px] text-ink-soft no-underline">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-cream">☎</span>
                +1 246 000 0000
              </a>
              <a href="mailto:hello@mistatravel.com" className="flex items-center gap-3 text-[14px] text-ink-soft no-underline">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-cream">✉</span>
                hello@mistatravel.com
              </a>
              <a href="https://wa.me/12460000000" className="flex items-center gap-3 text-[14px] text-ink-soft no-underline">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-green/[0.12] text-[11px] font-bold text-green">WA</span>
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
