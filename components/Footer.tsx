import Image from "next/image";
import Link from "next/link";
import { getSiteContent } from "@/lib/queries";

const SOCIALS = [
  { label: "Instagram", icon: "IG" },
  { label: "Facebook", icon: "FB" },
  { label: "TripAdvisor", icon: "TA" },
];

export async function Footer() {
  const content = await getSiteContent();
  const tourLinks = (content.footer_popular_tours as string[] | undefined) ?? [];

  return (
    <footer className="border-t border-gold/20 bg-[#0A0D0C] font-body text-[#C9CFCB]">
      <div className="mx-auto max-w-[1280px] px-8 pt-16">
        <div className="grid grid-cols-1 gap-12 min-[541px]:grid-cols-2 min-[861px]:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-[18px] flex items-center gap-3">
              <span className="relative h-[46px] w-[46px] overflow-hidden rounded-full border-[1.5px] border-gold/60">
                <Image src="/logo-mark.png" alt="Mista Concierge" fill className="object-cover" />
              </span>
              <span className="text-gold-gradient font-serif text-[19px] font-bold">
                Mista Concierge
              </span>
            </div>
            <p className="mb-5 max-w-[320px] text-[14px] leading-[1.7] text-[#9AA39E]">
              Bespoke luxury journeys across the Caribbean — from the Pitons of
              St. Lucia to the cays of the Bahamas, crafted by islanders who know
              every hidden cove.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-white/[0.06] font-sans text-[13px] font-semibold text-[#C9CFCB] no-underline transition-colors hover:bg-gold hover:text-[#1F2A26]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-[18px] font-sans text-[13px] font-semibold uppercase tracking-[1.5px] text-gold">
              Popular Tours
            </h4>
            <div className="flex flex-col gap-[11px]">
              {tourLinks.map((t) => (
                <Link
                  key={t}
                  href="/tours"
                  className="text-[14px] text-[#9AA39E] no-underline transition-colors hover:text-sand"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-[18px] font-sans text-[13px] font-semibold uppercase tracking-[1.5px] text-gold">
              Contact
            </h4>
            <div className="flex flex-col gap-[11px] text-[14px] text-[#9AA39E]">
              <a href="tel:+12460000000" className="no-underline hover:text-sand">+1 246 000 0000</a>
              <a href="mailto:hello@mistatravel.com" className="no-underline hover:text-sand">hello@mistatravel.com</a>
              <a href="https://wa.me/12460000000" className="no-underline hover:text-sand">WhatsApp: Message us</a>
              <span className="leading-[1.6]">
                Hastings Main Road, Christ Church
                <br />
                Barbados, Caribbean
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-[18px] font-sans text-[13px] font-semibold uppercase tracking-[1.5px] text-gold">
              Explore
            </h4>
            <div className="flex flex-col gap-[11px] text-[14px]">
              <Link href="/destinations" className="text-[#9AA39E] no-underline hover:text-sand">Destinations</Link>
              <Link href="/about" className="text-[#9AA39E] no-underline hover:text-sand">About Us</Link>
              <Link href="/tours" className="text-[#9AA39E] no-underline hover:text-sand">All Tours</Link>
              <Link href="/contact" className="text-[#9AA39E] no-underline hover:text-sand">Plan a Trip</Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-3.5 border-t border-white/[0.08] py-6 text-[13px] text-[#7C857F] min-[541px]:flex-row min-[541px]:justify-between">
          <span>© 2026 Mista Concierge Travel. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="text-[#7C857F] no-underline hover:text-[#C9CFCB]">Terms</a>
            <a href="#" className="text-[#7C857F] no-underline hover:text-[#C9CFCB]">Privacy</a>
            <a href="#" className="text-[#7C857F] no-underline hover:text-[#C9CFCB]">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
