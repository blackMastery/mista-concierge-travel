"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Social-proof toast that slides in shortly after the page loads, then leaves.
export function LiveBookingToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 4000);
    const t2 = setTimeout(() => setVisible(false), 11000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-[26px] left-[26px] z-[900] flex max-w-[300px] items-center gap-3.5 rounded-xl border-l-4 border-green bg-white px-[18px] py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.16)]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-[18px]">
            🌴
          </div>
          <div>
            <div className="font-sans text-[13.5px] font-semibold text-ink">
              Sofia from Madrid
            </div>
            <div className="text-[12.5px] text-muted">
              just booked the St. Lucia Escape · 2 min ago
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
