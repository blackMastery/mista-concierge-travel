"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "▥" },
  { label: "Tours", href: "/admin/tours", icon: "✦" },
  { label: "Destinations", href: "/admin/destinations", icon: "◉" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "❝" },
  { label: "Team", href: "/admin/team", icon: "☺" },
  { label: "Reviews", href: "/admin/reviews", icon: "★" },
  { label: "Site Content", href: "/admin/content", icon: "✎" },
  { label: "Bookings", href: "/admin/bookings", icon: "🧭" },
  { label: "Messages", href: "/admin/messages", icon: "✉" },
  { label: "Subscribers", href: "/admin/subscribers", icon: "@" },
];

function active(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-r border-gold/15 bg-[#0A0D0C] lg:h-screen lg:w-[244px] lg:sticky lg:top-0">
      <div className="flex items-center gap-2.5 border-b border-gold/15 px-5 py-[18px]">
        <span className="relative h-9 w-9 overflow-hidden rounded-full border border-gold/60">
          <Image src="/logo-mark.png" alt="Mista" fill className="object-cover" />
        </span>
        <div className="leading-tight">
          <div className="text-gold-gradient font-serif text-[15px] font-bold">
            Mista Admin
          </div>
          <div className="font-sans text-[10px] uppercase tracking-[1.5px] text-[#C9A24A]">
            Content Studio
          </div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-[13.5px] font-medium no-underline transition-colors ${
              active(pathname, item.href)
                ? "bg-green/20 text-gold-light"
                : "text-[#C9CFCB] hover:bg-white/[0.05] hover:text-sand"
            }`}
          >
            <span className="w-4 text-center text-[13px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gold/15 px-4 py-4">
        <div className="mb-3 truncate font-sans text-[12px] text-[#9AA39E]" title={email}>
          {email}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-gold/30 px-3 py-2 font-sans text-[12.5px] font-semibold text-gold-light no-underline transition-colors hover:bg-gold hover:text-[#0A0D0C]"
          >
            View site ↗
          </Link>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
