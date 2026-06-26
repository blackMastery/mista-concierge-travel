import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui";
import { TourCard, type TourCardData } from "@/components/TourCard";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "My Account" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold/15 text-gold-deep",
  confirmed: "bg-green/[0.12] text-green",
  cancelled: "bg-coral/[0.12] text-coral",
};

export default async function AccountPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const [{ data: profile }, { data: favRows }, { data: bookings }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("favorites")
        .select("tours(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("booking_requests")
        .select("*, tours(title, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const favorites = ((favRows ?? []) as unknown as {
    tours: TourCardData | null;
  }[])
    .map((r) => r.tours)
    .filter((t): t is TourCardData => !!t);

  type BookingRow = {
    id: string;
    travelers: number;
    travel_date: string | null;
    insurance: boolean;
    total_cents: number;
    status: string;
    reference_code: string;
    tours: { title: string; slug: string } | null;
  };
  const bookingRows = (bookings ?? []) as unknown as BookingRow[];

  const profileRow = profile as { full_name: string | null } | null;
  const firstName =
    profileRow?.full_name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "traveler";

  return (
    <div className="bg-sand">
      <section className="mx-auto max-w-[1280px] px-8 py-[72px] max-[640px]:px-[22px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Your Account</Eyebrow>
            <h1 className="m-0 mt-2.5 font-serif text-[42px] font-bold text-ink max-[640px]:text-[32px]">
              Welcome back, {firstName}
            </h1>
          </div>
          <SignOutButton />
        </div>

        {/* SAVED TOURS */}
        <h2 className="m-0 mb-6 font-serif text-[26px] font-semibold text-ink">
          Saved tours
        </h2>
        {favorites.length > 0 ? (
          <div className="mb-16 grid grid-cols-3 gap-7 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
            {favorites.map((t) => (
              <TourCard key={t.id} tour={t} isFavorite />
            ))}
          </div>
        ) : (
          <div className="mb-16 rounded-2xl bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="mb-3 text-[36px]">♡</div>
            <p className="m-0 mb-5 text-[15px] text-muted">
              You haven&apos;t saved any tours yet.
            </p>
            <Link
              href="/tours"
              className="inline-block rounded-lg bg-green px-7 py-3 font-sans text-[14px] font-semibold text-white no-underline"
            >
              Browse tours
            </Link>
          </div>
        )}

        {/* BOOKING REQUESTS */}
        <h2 className="m-0 mb-6 font-serif text-[26px] font-semibold text-ink">
          Booking requests
        </h2>
        {bookingRows.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {bookingRows.map((b) => {
              const tour = b.tours;
              return (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 px-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                >
                  <div>
                    <Link
                      href={tour ? `/tours/${tour.slug}` : "/tours"}
                      className="font-sans text-[16px] font-semibold text-ink no-underline hover:text-green"
                    >
                      {tour?.title ?? "Tour"}
                    </Link>
                    <div className="mt-1 text-[13px] text-muted">
                      <span className="font-mono text-[12px] font-semibold text-green">
                        {b.reference_code}
                      </span>
                      {" · "}
                      {b.travelers} {b.travelers === 1 ? "traveler" : "travelers"}
                      {b.travel_date ? ` · ${b.travel_date}` : ""}
                      {b.insurance ? " · insured" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-[18px] font-bold text-green">
                      {formatPrice(b.total_cents)}
                    </span>
                    <span
                      className={`rounded-md px-3 py-1 font-sans text-[12px] font-semibold capitalize ${
                        STATUS_STYLES[b.status] ?? "bg-cream text-muted"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="mb-3 text-[36px]">🧭</div>
            <p className="m-0 mb-5 text-[15px] text-muted">
              No booking requests yet. Found a journey you love?
            </p>
            <Link
              href="/tours"
              className="inline-block rounded-lg bg-green px-7 py-3 font-sans text-[14px] font-semibold text-white no-underline"
            >
              Explore tours
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
