import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { BookingStatusSelect } from "@/components/admin/LeadControls";
import { getAdminBookings } from "@/lib/admin-queries";
import { formatPrice } from "@/lib/format";

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();
  return (
    <div>
      <PageHeader title="Booking requests" subtitle={`${bookings.length} total`} />
      {bookings.length === 0 ? (
        <EmptyState icon="🧭" text="No booking requests yet." />
      ) : (
        <Card className="!p-0">
          <div className="divide-y divide-ink/[0.06]">
            {bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-[15px] font-semibold text-ink">{b.tours?.title ?? "Tour"}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted">
                    {b.travelers} {b.travelers === 1 ? "traveler" : "travelers"}
                    {b.travel_date ? ` · ${b.travel_date}` : ""}
                    {b.insurance ? " · insured" : ""}
                    {b.contact_email ? ` · ${b.contact_email}` : ""}
                    {" · "}
                    {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="font-serif text-[17px] font-bold text-green">{formatPrice(b.total_cents)}</span>
                <BookingStatusSelect id={b.id} status={b.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
