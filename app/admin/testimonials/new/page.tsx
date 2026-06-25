import Link from "next/link";
import { PageHeader, Card } from "@/components/admin/ui";
import { TestimonialForm } from "@/components/admin/EntityForms";

export default function NewTestimonialPage() {
  return (
    <div>
      <Link href="/admin/testimonials" className="mb-4 inline-block font-sans text-[13px] font-semibold text-green no-underline">
        ← Testimonials
      </Link>
      <PageHeader title="New testimonial" />
      <Card>
        <TestimonialForm mode="new" />
      </Card>
    </div>
  );
}
