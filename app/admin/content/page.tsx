import { PageHeader, Card } from "@/components/admin/ui";
import {
  ObjectBlockEditor,
  ArrayBlockEditor,
  StringArrayEditor,
  PaymentTermsBlockEditor,
} from "@/components/admin/ContentEditors";
import { getSiteContent } from "@/lib/queries";
import type { PaymentTerms } from "@/lib/database.types";

type Obj = Record<string, string>;

export default async function AdminContentPage() {
  const content = await getSiteContent();
  const get = <T,>(key: string, fallback: T): T =>
    (content[key] as T | undefined) ?? fallback;

  return (
    <div>
      <PageHeader title="Site content" subtitle="Edit the brand copy blocks shown across the marketing site." />

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="m-0 mb-1 font-serif text-[20px] font-semibold text-ink">Payment terms (default)</h2>
          <p className="m-0 mb-4 text-[13px] text-muted-light">
            Applies to every tour unless a tour overrides it on its own page.
          </p>
          <PaymentTermsBlockEditor
            initial={get<PaymentTerms | null>("payment_terms", null)}
          />
        </Card>

        <Card>
          <h2 className="m-0 mb-4 font-serif text-[20px] font-semibold text-ink">Promo banner</h2>
          <ObjectBlockEditor
            contentKey="promo_banner"
            fields={[
              { name: "strong", label: "Bold prefix" },
              { name: "text", label: "Message" },
              { name: "cta_label", label: "Link label" },
              { name: "cta_href", label: "Link href" },
            ]}
            initial={get<Obj>("promo_banner", {})}
          />
        </Card>

        <Card>
          <h2 className="m-0 mb-4 font-serif text-[20px] font-semibold text-ink">Hero stats</h2>
          <ArrayBlockEditor
            contentKey="hero_stats"
            fields={[
              { name: "num", label: "Number" },
              { name: "label", label: "Label" },
            ]}
            initial={get<Obj[]>("hero_stats", [])}
          />
        </Card>

        <Card>
          <h2 className="m-0 mb-4 font-serif text-[20px] font-semibold text-ink">Why-choose pillars</h2>
          <ArrayBlockEditor
            contentKey="pillars"
            fields={[
              { name: "icon", label: "Icon (emoji)" },
              { name: "title", label: "Title" },
              { name: "body", label: "Body", textarea: true },
            ]}
            initial={get<Obj[]>("pillars", [])}
          />
        </Card>

        <Card>
          <h2 className="m-0 mb-4 font-serif text-[20px] font-semibold text-ink">About values</h2>
          <ArrayBlockEditor
            contentKey="values"
            fields={[
              { name: "icon", label: "Icon (emoji)" },
              { name: "title", label: "Title" },
              { name: "body", label: "Body", textarea: true },
            ]}
            initial={get<Obj[]>("values", [])}
          />
        </Card>

        <Card>
          <h2 className="m-0 mb-4 font-serif text-[20px] font-semibold text-ink">Certifications</h2>
          <ArrayBlockEditor
            contentKey="certs"
            fields={[
              { name: "big", label: "Headline" },
              { name: "label", label: "Caption" },
            ]}
            initial={get<Obj[]>("certs", [])}
          />
        </Card>

        <Card>
          <h2 className="m-0 mb-4 font-serif text-[20px] font-semibold text-ink">Footer · popular tours</h2>
          <StringArrayEditor
            contentKey="footer_popular_tours"
            initial={get<string[]>("footer_popular_tours", [])}
          />
        </Card>
      </div>
    </div>
  );
}
