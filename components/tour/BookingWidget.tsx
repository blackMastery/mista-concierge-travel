"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createBookingRequest } from "@/app/actions";
import { formatPrice, formatDate } from "@/lib/format";
import type { TourPricing, PaymentTerms } from "@/lib/database.types";

export function BookingWidget({
  tourId,
  basePriceCents,
  spotsLeft,
  pricing,
  paymentTerms,
  depositOpen,
}: {
  tourId: string;
  basePriceCents: number;
  spotsLeft: number | null;
  pricing: TourPricing | null;
  paymentTerms: PaymentTerms | null;
  depositOpen: boolean;
}) {
  const occupancy = pricing?.occupancy ?? [];
  const childTiers = pricing?.children ?? [];
  const hasTiers = occupancy.length > 0;

  const [date, setDate] = useState("");
  const [occIdx, setOccIdx] = useState(0);
  const [adults, setAdults] = useState(2);
  const [childCounts, setChildCounts] = useState<number[]>(() =>
    childTiers.map(() => 0),
  );
  const [travelers, setTravelers] = useState(2); // legacy fallback
  const [booked, setBooked] = useState(false);
  const [pending, startTransition] = useTransition();

  const selectedTier = occupancy[occIdx] ?? occupancy[0];
  const childTotal = childCounts.reduce((a, b) => a + b, 0);
  const people = hasTiers ? adults + childTotal : travelers;

  const totalCents = hasTiers
    ? adults * (selectedTier?.price_cents ?? 0) +
      childCounts.reduce(
        (sum, n, i) => sum + n * (childTiers[i]?.price_cents ?? 0),
        0,
      )
    : basePriceCents * travelers;

  const depositCents =
    paymentTerms && depositOpen
      ? paymentTerms.deposit_per === "person"
        ? paymentTerms.deposit_cents * people
        : paymentTerms.deposit_cents
      : 0;

  function setChild(i: number, v: number) {
    setChildCounts((s) => s.map((n, idx) => (idx === i ? Math.max(0, v) : n)));
  }

  function book() {
    const breakdown = hasTiers
      ? {
          occupancy_label: selectedTier?.label ?? null,
          occupants: selectedTier?.occupants ?? null,
          per_person_cents: selectedTier?.price_cents ?? null,
          adults,
          children: childTiers.map((c, i) => ({
            key: c.key,
            label: c.label,
            count: childCounts[i] ?? 0,
            price_cents: c.price_cents,
          })),
          deposit_cents: depositCents,
          total_cents: totalCents,
        }
      : null;

    startTransition(async () => {
      const res = await createBookingRequest({
        tourId,
        travelDate: date,
        travelers: people,
        insurance: false,
        totalCents,
        pricingBreakdown: breakdown,
      });
      if (res.ok) setBooked(true);
    });
  }

  const labelCls =
    "mb-1.5 block font-sans text-[12px] font-semibold text-muted";
  const fieldCls =
    "w-full rounded-lg border-[1.5px] border-ink/15 px-3.5 py-3 font-body text-[14px] text-ink outline-none focus:border-green";

  const fromCents = hasTiers
    ? Math.min(...occupancy.map((t) => t.price_cents).filter((c) => c > 0))
    : basePriceCents;

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
        {formatPrice(Number.isFinite(fromCents) ? fromCents : basePriceCents)}
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

          {hasTiers ? (
            <>
              <div>
                <label className={labelCls}>Room occupancy</label>
                <select
                  value={occIdx}
                  onChange={(e) => setOccIdx(Number(e.target.value))}
                  className={`${fieldCls} cursor-pointer bg-white`}
                >
                  {occupancy.map((t, i) => (
                    <option key={i} value={i}>
                      {t.label} — {formatPrice(t.price_cents)} / person
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Adults</label>
                <input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value || 1)))}
                  className={fieldCls}
                />
              </div>
              {childTiers.map((c, i) => (
                <div key={c.key}>
                  <label className={labelCls}>
                    {c.label} — {formatPrice(c.price_cents)} / child
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={childCounts[i] ?? 0}
                    onChange={(e) => setChild(i, Number(e.target.value || 0))}
                    className={fieldCls}
                  />
                </div>
              ))}
            </>
          ) : (
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
          )}

          <div className="flex items-center justify-between border-t border-ink/[0.08] pt-3">
            <span className="font-sans text-[15px] font-semibold text-ink">Total</span>
            <span className="font-serif text-[24px] font-bold text-green">
              {formatPrice(totalCents)}
            </span>
          </div>

          {paymentTerms && (
            <div className="rounded-[10px] bg-[#F7F3EA] p-3.5">
              {depositOpen ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink">
                      Deposit due now
                      {paymentTerms.deposit_per === "person" ? ` (${people} × ${formatPrice(paymentTerms.deposit_cents)})` : ""}
                    </span>
                    <span className="font-sans text-[15px] font-bold text-green">
                      {formatPrice(depositCents)}
                    </span>
                  </div>
                  {paymentTerms.deadline && (
                    <p className="m-0 mt-1.5 text-[12px] leading-[1.5] text-ink-soft">
                      Pay your deposit to book by{" "}
                      <strong>{formatDate(paymentTerms.deadline)}</strong>. Balance
                      due after that.
                    </p>
                  )}
                </>
              ) : (
                <p className="m-0 text-[13px] leading-[1.5] text-ink-soft">
                  <strong className="text-ink">Final payment in full.</strong>{" "}
                  {paymentTerms.final_note}
                </p>
              )}
              {paymentTerms.methods.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {paymentTerms.methods.map((m) => (
                    <span
                      key={m}
                      className="rounded-md bg-white px-2.5 py-1 font-sans text-[11px] font-semibold text-green"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

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
