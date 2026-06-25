"use client";

import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import { createTour, updateTour, type TourInput } from "@/app/admin/actions";
import type { Tour } from "@/lib/database.types";

type Opt = { id: string; name: string };

const empty = {
  title: "",
  slug: "",
  destination_id: "",
  location: "",
  priceDollars: "",
  rating: "4.9",
  reviews_count: "0",
  duration_days: "1",
  duration_label: "",
  badge: "",
  badge_color: "#1B7A5C",
  card_image_url: "",
  overview: "",
  is_featured: false,
  spots_left: "",
  booked_last_24h: "",
  sort_order: "0",
};

export function TourForm({
  mode,
  tour,
  destinations,
}: {
  mode: "new" | "edit";
  tour?: Tour;
  destinations: Opt[];
}) {
  const [f, setF] = useState(
    tour
      ? {
          title: tour.title,
          slug: tour.slug,
          destination_id: tour.destination_id,
          location: tour.location,
          priceDollars: String(Math.round(tour.price_cents / 100)),
          rating: String(tour.rating),
          reviews_count: String(tour.reviews_count),
          duration_days: String(tour.duration_days),
          duration_label: tour.duration_label,
          badge: tour.badge ?? "",
          badge_color: tour.badge_color,
          card_image_url: tour.card_image_url,
          overview: tour.overview ?? "",
          is_featured: tour.is_featured,
          spots_left: tour.spots_left?.toString() ?? "",
          booked_last_24h: tour.booked_last_24h?.toString() ?? "",
          sort_order: String(tour.sort_order),
        }
      : empty,
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((s) => ({ ...s, [k]: v }));
  }

  function buildInput(): TourInput {
    return {
      title: f.title.trim(),
      slug: f.slug.trim(),
      destination_id: f.destination_id,
      location: f.location.trim(),
      price_cents: Math.round(Number(f.priceDollars || 0) * 100),
      rating: Number(f.rating || 0),
      reviews_count: Number(f.reviews_count || 0),
      duration_days: Number(f.duration_days || 1),
      duration_label: f.duration_label.trim(),
      badge: f.badge.trim() || null,
      badge_color: f.badge_color || "#1B7A5C",
      card_image_url: f.card_image_url.trim(),
      overview: f.overview.trim() || null,
      is_featured: f.is_featured,
      spots_left: f.spots_left === "" ? null : Number(f.spots_left),
      booked_last_24h: f.booked_last_24h === "" ? null : Number(f.booked_last_24h),
      sort_order: Number(f.sort_order || 0),
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const input = buildInput();
      if (mode === "new") {
        await createTour(input); // redirects to the edit page
      } else if (tour) {
        const res = await updateTour(tour.id, input);
        setMsg(res.ok ? "Saved." : res.error ?? "Could not save.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <input className={inputCls} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="st-lucia-piton-escape" required />
        </div>
        <div>
          <label className={labelCls}>Destination</label>
          <select className={inputCls} value={f.destination_id} onChange={(e) => set("destination_id", e.target.value)} required>
            <option value="">Select…</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Location label</label>
          <input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Soufrière, St. Lucia" required />
        </div>
        <div>
          <label className={labelCls}>Price (USD / person)</label>
          <input className={inputCls} type="number" min="0" value={f.priceDollars} onChange={(e) => set("priceDollars", e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Duration label</label>
          <input className={inputCls} value={f.duration_label} onChange={(e) => set("duration_label", e.target.value)} placeholder="5 days · 4 nights" required />
        </div>
        <div>
          <label className={labelCls}>Duration (days)</label>
          <input className={inputCls} type="number" min="1" value={f.duration_days} onChange={(e) => set("duration_days", e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Sort order</label>
          <input className={inputCls} type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Rating</label>
          <input className={inputCls} type="number" step="0.1" min="0" max="5" value={f.rating} onChange={(e) => set("rating", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Reviews count</label>
          <input className={inputCls} type="number" min="0" value={f.reviews_count} onChange={(e) => set("reviews_count", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Badge (optional)</label>
          <input className={inputCls} value={f.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Bestseller" />
        </div>
        <div>
          <label className={labelCls}>Badge color</label>
          <input className={inputCls} value={f.badge_color} onChange={(e) => set("badge_color", e.target.value)} placeholder="#FF6B5B" />
        </div>
        <div>
          <label className={labelCls}>Spots left (optional)</label>
          <input className={inputCls} type="number" min="0" value={f.spots_left} onChange={(e) => set("spots_left", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Booked last 24h (optional)</label>
          <input className={inputCls} type="number" min="0" value={f.booked_last_24h} onChange={(e) => set("booked_last_24h", e.target.value)} />
        </div>
      </div>

      <ImageUploader
        label="Card image"
        folder="tours"
        value={f.card_image_url}
        onChange={(url) => set("card_image_url", url)}
      />

      <div>
        <label className={labelCls}>Overview</label>
        <textarea className={`${inputCls} min-h-[120px] resize-y`} value={f.overview} onChange={(e) => set("overview", e.target.value)} />
      </div>

      <label className="flex items-center gap-2.5 text-[14px] text-ink">
        <input type="checkbox" className="h-[18px] w-[18px] accent-green" checked={f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
        Featured on the homepage
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Saving…" : mode === "new" ? "Create tour" : "Save changes"}
        </button>
        {msg && <span className="text-[13px] text-green">{msg}</span>}
      </div>
    </form>
  );
}
