"use client";

import { useMemo, useState } from "react";
import { TourCard } from "@/components/TourCard";
import { formatPrice } from "@/lib/format";

export type ClientTour = {
  id: string;
  slug: string;
  title: string;
  location: string;
  price_cents: number;
  rating: number;
  reviews_count: number;
  duration_label: string;
  duration_days: number;
  badge: string | null;
  badge_color: string;
  card_image_url: string;
  destName: string;
  acts: string[];
  isFavorite: boolean;
};

type DestOption = { name: string; count: number };

const DURATIONS = [
  { label: "Any duration", val: "any" },
  { label: "1–3 days", val: "1-3" },
  { label: "4–7 days", val: "4-7" },
  { label: "8+ days", val: "8+" },
];
const RATINGS = [
  { label: "Any rating", val: 0 },
  { label: "4.5 ★ & up", val: 4.5 },
  { label: "4.8 ★ & up", val: 4.8 },
];
const SORTS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const H4 = "mb-3 font-sans text-[12px] font-semibold uppercase tracking-[1px] text-muted-light";

export function ToursClient({
  tours,
  destOptions,
  activityTypes,
}: {
  tours: ClientTour[];
  destOptions: DestOption[];
  activityTypes: string[];
}) {
  const [dests, setDests] = useState<Record<string, boolean>>({});
  const [acts, setActs] = useState<Record<string, boolean>>({});
  const [maxPrice, setMaxPrice] = useState(5500);
  const [dur, setDur] = useState("any");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("popular");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggle(
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string,
  ) {
    setter((s) => ({ ...s, [key]: !s[key] }));
  }

  function reset() {
    setDests({});
    setActs({});
    setMaxPrice(5500);
    setDur("any");
    setMinRating(0);
  }

  const result = useMemo(() => {
    const dSel = Object.keys(dests).filter((k) => dests[k]);
    const aSel = Object.keys(acts).filter((k) => acts[k]);
    const filtered = tours.filter((t) => {
      if (dSel.length && !dSel.includes(t.destName)) return false;
      if (aSel.length && !t.acts.some((a) => aSel.includes(a))) return false;
      if (t.price_cents > maxPrice * 100) return false;
      if (dur === "1-3" && !(t.duration_days >= 1 && t.duration_days <= 3)) return false;
      if (dur === "4-7" && !(t.duration_days >= 4 && t.duration_days <= 7)) return false;
      if (dur === "8+" && !(t.duration_days >= 8)) return false;
      if (t.rating < minRating) return false;
      return true;
    });
    const sorters: Record<string, (a: ClientTour, b: ClientTour) => number> = {
      popular: (a, b) => b.reviews_count - a.reviews_count,
      newest: () => 0, // server already orders newest-first
      "price-low": (a, b) => a.price_cents - b.price_cents,
      "price-high": (a, b) => b.price_cents - a.price_cents,
      rating: (a, b) => b.rating - a.rating,
    };
    return [...filtered].sort(sorters[sort] ?? sorters.popular);
  }, [tours, dests, acts, maxPrice, dur, minRating, sort]);

  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-20 pt-9 max-[640px]:px-[22px]">
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className="mb-[18px] items-center gap-2 rounded-lg border border-ink/[0.12] bg-white px-[18px] py-[11px] font-sans text-[14px] font-semibold text-green min-[901px]:hidden inline-flex"
      >
        ☰ Filters
      </button>

      <div className="grid grid-cols-[280px_1fr] items-start gap-[34px] max-[900px]:grid-cols-1">
        {/* SIDEBAR */}
        <aside
          className={`sticky top-24 rounded-2xl bg-white p-[26px] px-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-[900px]:static ${
            sidebarOpen ? "" : "max-[900px]:hidden"
          }`}
        >
          <div className="mb-[22px] flex items-center justify-between">
            <h3 className="m-0 font-sans text-[16px] font-bold text-ink">Filters</h3>
            <button
              onClick={reset}
              className="border-none bg-transparent font-sans text-[12.5px] font-semibold text-green"
            >
              Reset
            </button>
          </div>

          <div className="mb-6">
            <h4 className={H4}>Destination</h4>
            {destOptions.map((o) => (
              <label
                key={o.name}
                className="flex cursor-pointer items-center gap-2.5 py-[5px] text-[14px] text-ink"
              >
                <input
                  type="checkbox"
                  checked={!!dests[o.name]}
                  onChange={() => toggle(setDests, o.name)}
                  className="h-[17px] w-[17px] cursor-pointer accent-green"
                />
                <span className="flex-1">{o.name}</span>
                <span className="text-[12px] text-[#A8A8A8]">{o.count}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <h4 className={H4}>Max Price</h4>
            <input
              type="range"
              className="mc-range w-full"
              min={900}
              max={5500}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="mt-2 flex justify-between text-[13px] text-muted">
              <span>$900</span>
              <span className="font-semibold text-green">
                Up to {formatPrice(maxPrice * 100)}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className={H4}>Duration</h4>
            {DURATIONS.map((o) => (
              <label
                key={o.val}
                className="flex cursor-pointer items-center gap-2.5 py-[5px] text-[14px] text-ink"
              >
                <input
                  type="radio"
                  name="mc-dur"
                  checked={dur === o.val}
                  onChange={() => setDur(o.val)}
                  className="h-4 w-4 cursor-pointer accent-green"
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <h4 className={H4}>Activity Type</h4>
            {activityTypes.map((a) => (
              <label
                key={a}
                className="flex cursor-pointer items-center gap-2.5 py-[5px] text-[14px] text-ink"
              >
                <input
                  type="checkbox"
                  checked={!!acts[a]}
                  onChange={() => toggle(setActs, a)}
                  className="h-[17px] w-[17px] cursor-pointer accent-green"
                />
                <span>{a}</span>
              </label>
            ))}
          </div>

          <div>
            <h4 className={H4}>Rating</h4>
            {RATINGS.map((o) => (
              <label
                key={o.val}
                className="flex cursor-pointer items-center gap-2.5 py-[5px] text-[14px] text-ink"
              >
                <input
                  type="radio"
                  name="mc-rate"
                  checked={minRating === o.val}
                  onChange={() => setMinRating(o.val)}
                  className="h-4 w-4 cursor-pointer accent-green"
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <div>
          <div className="mb-6 flex items-center justify-between max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3.5">
            <p className="m-0 text-[14.5px] text-muted">
              <strong className="font-semibold text-ink">{result.length}</strong>{" "}
              experiences found
            </p>
            <div className="flex items-center gap-2.5">
              <span className="font-sans text-[13px] text-muted-light">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer rounded-lg border border-ink/15 bg-white px-3.5 py-[9px] font-sans text-[13.5px] font-medium text-ink outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {result.length > 0 ? (
            <div className="grid grid-cols-3 gap-[26px] max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
              {result.map((t) => (
                <TourCard key={t.id} tour={t} isFavorite={t.isFavorite} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-[60px] px-[30px] text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="mb-3.5 text-[40px]">🧭</div>
              <h3 className="m-0 mb-2 font-serif text-[24px] font-semibold text-ink">
                No tours match your filters
              </h3>
              <p className="m-0 mb-[22px] text-[15px] text-muted">
                Try widening your price range or clearing a filter.
              </p>
              <button
                onClick={reset}
                className="rounded-lg bg-green px-7 py-3 font-sans text-[14px] font-semibold text-white"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
