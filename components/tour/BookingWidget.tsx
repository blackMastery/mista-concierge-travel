"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createBookingRequest } from "@/app/actions";
import { formatPrice, formatDate } from "@/lib/format";
import type { TourPricing, PaymentTerms } from "@/lib/database.types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function BookingWidget({
  tourId,
  basePriceCents,
  spotsLeft,
  pricing,
  paymentTerms,
  depositOpen,
  userEmail,
  userName,
}: {
  tourId: string;
  basePriceCents: number;
  spotsLeft: number | null;
  pricing: TourPricing | null;
  paymentTerms: PaymentTerms | null;
  depositOpen: boolean;
  userEmail?: string | null;
  userName?: string | null;
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
  const [travelers, setTravelers] = useState(2);
  const [contactName, setContactName] = useState(userName ?? "");
  const [contactEmail, setContactEmail] = useState(userEmail ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [booked, setBooked] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedTier = occupancy[occIdx] ?? occupancy[0];
  const childTotal = childCounts.reduce((a, b) => a + b, 0);
  const people = hasTiers ? adults + childTotal : travelers;

  const totalCents = hasTiers
    ? (selectedTier?.price_cents ?? 0) +
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

  function validate(): string | null {
    if (!date) return "Please select a travel date.";
    if (date < todayISO()) return "Travel date must be today or later.";
    if (!contactName.trim()) return "Please enter your name.";
    if (!EMAIL_RE.test(contactEmail.trim())) return "Please enter a valid email.";
    if (!contactPhone.trim()) return "Please enter your phone number.";
    if (people < 1) return "Please select at least one traveler.";
    return null;
  }

  function book() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    const breakdown = hasTiers
      ? {
          occupancy_label: selectedTier?.label ?? null,
          occupants: selectedTier?.occupants ?? null,
          tier_price_cents: selectedTier?.price_cents ?? null,
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
      : {
          deposit_cents: depositCents,
          total_cents: totalCents,
        };

    startTransition(async () => {
      const res = await createBookingRequest({
        tourId,
        travelDate: date,
        travelers: people,
        insurance: false,
        totalCents,
        pricingBreakdown: breakdown,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        specialRequests: specialRequests.trim() || undefined,
      });
      if (res.ok && res.referenceCode) {
        setReferenceCode(res.referenceCode);
        setBooked(true);
      } else {
        setError(res.error ?? "Could not submit your request.");
      }
    });
  }

  function resetForm() {
    setBooked(false);
    setReferenceCode("");
    setError("");
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
        {!hasTiers && (
          <span className="font-body text-[14px] font-normal text-muted-light">
            {" "}
            / person
          </span>
        )}
      </div>

      {booked ? (
        <div className="py-3.5 text-center" style={{ animation: "mcFadeIn 0.4s ease both" }}>
          <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-green/[0.12] text-[30px] text-green">
            ✓
          </div>
          <h3 className="m-0 mb-2 font-serif text-[22px] font-semibold text-ink">
            Request received!
          </h3>
          <p className="m-0 mb-3 text-[14px] leading-[1.6] text-muted">
            Your concierge will confirm availability and reach out within 24
            hours.
          </p>
          <div className="mb-4 rounded-xl bg-cream px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-muted">
              Booking reference
            </div>
            <div className="font-serif text-[26px] font-bold text-green">
              {referenceCode}
            </div>
          </div>
          <p className="m-0 mb-[18px] text-[13px] leading-[1.6] text-muted">
            Save this reference — we&apos;ve also emailed it to{" "}
            <strong className="text-ink">{contactEmail}</strong>.
          </p>
          <Link
            href={`/bookings/track?ref=${encodeURIComponent(referenceCode)}`}
            className="mb-3 inline-block w-full rounded-lg bg-green py-3.5 text-center font-sans text-[15px] font-semibold text-sand no-underline shadow-[0_6px_20px_rgba(27,122,92,0.3)]"
          >
            Track your booking
          </Link>
          <button
            onClick={resetForm}
            className="w-full rounded-lg border-2 border-gold px-6 py-[11px] font-sans text-[14px] font-semibold text-green"
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
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className={fieldCls}
              required
            />
          </div>

          {hasTiers ? (
            <>
              <div>
                <label className={labelCls}>Room occupancy</label>
                <select
                  value={occIdx}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setOccIdx(idx);
                    setAdults(occupancy[idx]?.occupants ?? 1);
                  }}
                  className={`${fieldCls} cursor-pointer bg-white`}
                >
                  {occupancy.map((t, i) => (
                    <option key={i} value={i}>
                      {t.label} — {formatPrice(t.price_cents)}
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
                  readOnly
                  className={`${fieldCls} bg-cream/50`}
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

          <div className="border-t border-ink/[0.08] pt-3">
            <div className="mb-3 font-sans text-[13px] font-semibold uppercase tracking-[0.5px] text-muted">
              Contact details
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Full name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={fieldCls}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={fieldCls}
                  placeholder="you@email.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={fieldCls}
                  placeholder="+1 246 000 0000"
                  autoComplete="tel"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  Special requests <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className={`${fieldCls} min-h-[72px] resize-y`}
                  placeholder="Dietary needs, room preferences, accessibility…"
                  rows={3}
                />
              </div>
            </div>
          </div>

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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 text-[13px] font-semibold text-ink">
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

          {error && (
            <p className="m-0 rounded-lg bg-coral/[0.1] px-3.5 py-2.5 text-[13px] text-coral" role="alert">
              {error}
            </p>
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
