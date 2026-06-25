"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createBookingRequest } from "@/app/actions";
import { formatPrice } from "@/lib/format";

const INSURANCE_CENTS = 12000; // +$120 / person

export function BookingWidget({
  tourId,
  basePriceCents,
  spotsLeft,
}: {
  tourId: string;
  basePriceCents: number;
  spotsLeft: number | null;
}) {
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [insurance, setInsurance] = useState(false);
  const [booked, setBooked] = useState(false);
  const [pending, startTransition] = useTransition();

  const perPerson = basePriceCents + (insurance ? INSURANCE_CENTS : 0);
  const totalCents = perPerson * travelers;

  function book() {
    startTransition(async () => {
      const res = await createBookingRequest({
        tourId,
        travelDate: date,
        travelers,
        insurance,
        totalCents,
      });
      if (res.ok) setBooked(true);
    });
  }

  const labelCls =
    "mb-1.5 block font-sans text-[12px] font-semibold text-muted";
  const fieldCls =
    "w-full rounded-lg border-[1.5px] border-ink/15 px-3.5 py-3 font-body text-[14px] text-ink outline-none focus:border-green";

  return (
    <div className="rounded-2xl border border-gold/25 bg-white p-[26px] shadow-[0_8px_32px_rgba(27,122,92,0.12)]">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] text-muted-light">From</span>
        {spotsLeft != null && (
          <span className="font-sans text-[12px] font-semibold text-coral">
            Only {spotsLeft} spots left
          </span>
        )}
      </div>
      <div className="mb-5 font-serif text-[36px] font-bold text-gold">
        {formatPrice(basePriceCents)}
        <span className="font-body text-[14px] font-normal text-muted-light">
          {" "}
          / person
        </span>
      </div>

      {booked ? (
        <div className="py-3.5 text-center" style={{ animation: "mcFadeIn 0.4s ease both" }}>
          <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-green/[0.12] text-[30px] text-green">
            ✓
          </div>
          <h3 className="m-0 mb-2 font-serif text-[22px] font-semibold text-ink">
            Request received!
          </h3>
          <p className="m-0 mb-[18px] text-[14px] leading-[1.6] text-muted">
            Your concierge will confirm availability and reach out within 24
            hours.
          </p>
          <button
            onClick={() => setBooked(false)}
            className="rounded-lg border-2 border-gold px-6 py-[11px] font-sans text-[14px] font-semibold text-green"
          >
            Make Another Request
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div>
            <label className={labelCls}>Travel date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>Travelers</label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className={`${fieldCls} cursor-pointer bg-white`}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>
                  {v} {v === 1 ? "traveler" : "travelers"}
                </option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-start gap-[11px] rounded-[10px] bg-[#F7F3EA] p-3.5">
            <input
              type="checkbox"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
              className="mt-px h-[18px] w-[18px] cursor-pointer accent-green"
            />
            <span className="text-[13px] leading-[1.45] text-ink-soft">
              <strong className="text-ink">Add travel insurance</strong> — full
              medical &amp; cancellation cover.{" "}
              <strong className="text-green">+$120/person</strong>
            </span>
          </label>
          <div className="flex items-center justify-between border-y border-ink/[0.08] py-3">
            <span className="font-sans text-[15px] font-semibold text-ink">Total</span>
            <span className="font-serif text-[24px] font-bold text-green">
              {formatPrice(totalCents)}
            </span>
          </div>
          <button
            onClick={book}
            disabled={pending}
            className="w-full rounded-lg bg-green py-4 font-sans text-[16px] font-semibold text-sand shadow-[0_6px_20px_rgba(27,122,92,0.3)] transition-all hover:-translate-y-px hover:bg-green-dark disabled:opacity-70"
          >
            {pending ? "Sending…" : "Book Now"}
          </button>
          <Link
            href="/contact"
            className="w-full rounded-lg border-2 border-gold py-3 text-center font-sans text-[15px] font-semibold text-green no-underline hover:bg-gold hover:text-white"
          >
            Contact a Concierge
          </Link>
        </div>
      )}
    </div>
  );
}
