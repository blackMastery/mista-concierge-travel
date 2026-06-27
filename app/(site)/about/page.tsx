import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";
import { getTeam, getSiteContent } from "@/lib/queries";
import type { PillarItem, CertItem } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "We don't sell trips. We craft the journeys you'll talk about for the rest of your life.",
  path: "/about",
});

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=80";

export default async function AboutPage() {
  const [team, content] = await Promise.all([getTeam(), getSiteContent()]);
  const values = (content.values as PillarItem[] | undefined) ?? [];
  const certs = (content.certs as CertItem[] | undefined) ?? [];

  return (
    <div>
      {/* HERO */}
      <section
        className="relative flex min-h-[420px] items-center px-8 py-[90px] max-[640px]:px-[22px]"
        style={{
          background: `linear-gradient(120deg,rgba(15,42,58,0.8),rgba(27,122,92,0.5)),url('${HERO_IMAGE}') center/cover`,
        }}
      >
        <div className="mx-auto w-full max-w-[1280px]">
          <Eyebrow>About Us</Eyebrow>
          <h1 className="m-0 mb-3 mt-3 max-w-[660px] font-serif text-[50px] font-bold leading-[1.08] text-sand max-[640px]:text-[34px]">
            Your gateway to unforgettable Caribbean experiences
          </h1>
          <p className="m-0 max-w-[560px] text-[17px] leading-[1.6] text-sand/90">
            We don&apos;t sell trips. We craft the journeys you&apos;ll talk
            about for the rest of your life.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-[1180px] px-8 py-[84px] max-[640px]:px-[22px]">
        <div className="grid grid-cols-2 items-center gap-14 max-[920px]:grid-cols-1">
          <Reveal>
            <Eyebrow className="!text-[12px]">Our Story</Eyebrow>
            <h2 className="m-0 mb-5 mt-3 font-serif text-[36px] font-bold leading-[1.15] text-ink max-[640px]:text-[28px]">
              Born on the islands, built for travelers
            </h2>
            <p className="m-0 mb-[18px] text-[15.5px] leading-[1.8] text-ink-soft">
              Mista Concierge Travel began in 2014 with a simple belief: the
              Caribbean deserves to be experienced, not just visited. Founder
              Marcus &ldquo;Mista&rdquo; Alleyne grew up sailing between the
              islands, and watched too many visitors leave having seen only a
              resort wall.
            </p>
            <p className="m-0 text-[15.5px] leading-[1.8] text-ink-soft">
              Today our team of islanders crafts bespoke journeys across fifteen
              destinations — opening doors to private chefs, hidden coves and
              family-run estates that no booking site can reach. Every itinerary
              is one of one.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative min-h-[480px] overflow-hidden rounded-[18px] border border-gold/25 bg-black shadow-[0_10px_40px_rgba(0,0,0,0.3)] max-[920px]:min-h-[320px]">
              <Image src="/logo-full.png" alt="Mista Concierge" fill className="object-contain" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ background: "linear-gradient(160deg,#1B7A5C,#15543F)" }}>
        <div className="mx-auto max-w-[1280px] px-8 py-[84px] max-[640px]:px-[22px]">
          <Reveal className="mx-auto mb-[50px] max-w-[620px] text-center">
            <Eyebrow>What We Stand For</Eyebrow>
            <h2 className="m-0 mt-3 font-serif text-[38px] font-bold text-sand max-[640px]:text-[28px]">
              Our core values
            </h2>
          </Reveal>
          <div className="grid grid-cols-4 gap-6 max-[920px]:grid-cols-2 max-[600px]:grid-cols-1">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <div className="rounded-2xl border border-sand/[0.14] bg-sand/[0.07] p-8 px-[26px] text-center">
                  <div className="mx-auto mb-[18px] flex h-[60px] w-[60px] items-center justify-center rounded-full border border-gold/40 bg-gold/[0.16] text-[24px]">
                    {v.icon}
                  </div>
                  <h3 className="m-0 mb-[9px] font-sans text-[18px] font-semibold text-sand">
                    {v.title}
                  </h3>
                  <p className="m-0 text-[14px] leading-[1.6] text-sand/[0.78]">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-[1280px] px-8 py-[84px] max-[640px]:px-[22px]">
        <Reveal className="mx-auto mb-[50px] max-w-[620px] text-center">
          <Eyebrow>The People</Eyebrow>
          <h2 className="m-0 mt-3 font-serif text-[38px] font-bold text-ink max-[640px]:text-[28px]">
            Meet our team
          </h2>
        </Reveal>
        <div className="grid grid-cols-4 gap-[26px] max-[920px]:grid-cols-2 max-[600px]:grid-cols-1">
          {team.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.06}>
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div
                  className="h-[240px] bg-blue"
                  style={{ background: `url('${m.photo_url}') center/cover` }}
                />
                <div className="p-[22px] pb-[26px]">
                  <h3 className="m-0 mb-[3px] font-serif text-[20px] font-semibold text-ink">
                    {m.name}
                  </h3>
                  <div className="mb-[11px] font-sans text-[12.5px] font-semibold uppercase tracking-[0.5px] text-green">
                    {m.role}
                  </div>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-muted">{m.bio}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CERTS */}
      <section className="bg-cream">
        <div className="mx-auto max-w-[1180px] px-8 py-16 text-center max-[640px]:px-[22px]">
          <p className="m-0 mb-7 font-sans text-[12px] font-semibold uppercase tracking-[2px] text-muted-light">
            Trusted &amp; Recognized
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {certs.map((c) => (
              <div key={c.label} className="flex min-w-[140px] flex-col items-center gap-2">
                <div className="font-serif text-[26px] font-bold text-green">{c.big}</div>
                <div className="text-center font-sans text-[12.5px] text-muted">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
