"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PromoBannerContent } from "@/lib/format";

export function PromoBanner({ content }: { content: PromoBannerContent }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("mc-banner-dismissed") === "1") setOpen(false);
  }, []);

  // The promo bar only appears on the home page.
  if (pathname !== "/") return null;

  function close() {
    setOpen(false);
    sessionStorage.setItem("mc-banner-dismissed", "1");
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="relative flex items-center justify-center gap-3.5 bg-blue px-4 py-[11px] pr-11 font-sans text-[13.5px] font-medium text-sand">
            <span>
              <strong className="text-gold">{content.strong}</strong>{" "}
              {content.text}
            </span>
            <Link
              href={content.cta_href}
              className="font-semibold text-gold underline"
            >
              {content.cta_label}
            </Link>
            <button
              onClick={close}
              aria-label="Dismiss"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent text-[18px] leading-none text-sand"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
