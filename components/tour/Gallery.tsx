"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Gallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(-1);
  const n = images.length;
  const isOpen = active >= 0;

  return (
    <>
      <div className="mb-[38px] grid grid-cols-4 gap-3 max-[920px]:grid-cols-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="h-[130px] overflow-hidden rounded-[10px] border-none bg-blue p-0 transition-transform hover:scale-[1.03]"
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-label={`Open image ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActive(-1)}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(15,24,20,0.92)]"
          >
            <button
              onClick={() => setActive(-1)}
              aria-label="Close"
              className="absolute right-7 top-6 flex h-[46px] w-[46px] items-center justify-center rounded-full border-none bg-white/[0.12] text-[24px] text-white"
            >
              ×
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive((c) => (c - 1 + n) % n);
              }}
              aria-label="Previous"
              className="absolute left-7 flex h-[52px] w-[52px] items-center justify-center rounded-full border-none bg-white/[0.12] text-[24px] text-white"
            >
              ‹
            </button>
            <motion.div
              key={active}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="h-[min(80vh,720px)] w-[min(86vw,1100px)] rounded-2xl bg-blue"
              style={{
                backgroundImage: `url('${images[active]}')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive((c) => (c + 1) % n);
              }}
              aria-label="Next"
              className="absolute right-7 flex h-[52px] w-[52px] items-center justify-center rounded-full border-none bg-white/[0.12] text-[24px] text-white"
            >
              ›
            </button>
            <div className="absolute bottom-7 font-sans text-[13px] text-white/80">
              {active + 1} / {n}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
