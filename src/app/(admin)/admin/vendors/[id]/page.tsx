import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/sourcing.css";
import { Icon } from "@/components/layout/icons";
import { AiBrief, type BriefPoint } from "@/components/ui/AiBrief";
import { VendorActions, VendorTabs } from "@/features/vendors/components/VendorTabs";
import { getTrackRecord, vendorList } from "@/features/vendors/data";

export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = vendorList.find((v) => v.id === id);
  if (!vendor) notFound();

  const record = getTrackRecord(vendor.id);
  const bids = record.filter((r) => r.outcome !== "Declined").length;
  const won = record.filter((r) => r.outcome === "Awarded").length;
  const winRate = bids ? Math.round((won / bids) * 100) : 0;

  const kpis = [
    { label: "Events invited", value: String(record.length) },
    { label: "Bids submitted", value: String(bids) },
    { label: "Awarded", value: String(won) },
    { label: "Win rate", value: `${winRate}%` },
  ];

  // Prototype copy — replace with an AI-generated brief for this vendor.
  const points: BriefPoint[] = [
    {
      short: `${won} of ${bids} bids won`,
      detail: `${vendor.name} has been awarded ${won} of the ${bids} events it bid on, a ${winRate}% win rate.`,
    },
    {
      short: `Performance score ${vendor.score}`,
      detail:
        vendor.score >= 80
          ? "Delivery and compliance history is strong; a low-risk invite for similar events."
          : "Score is below the preferred threshold. Review recent delivery and compliance issues before inviting.",
    },
    {
      short: `Status: ${vendor.status}`,
      detail:
        vendor.status === "Approved"
          ? "Documents are on file and the vendor can be invited to new events."
          : vendor.status === "Under review"
            ? "Onboarding review is still open; approve or request more documents before awarding."
            : "This vendor is blocked and cannot be invited to sourcing events.",
    },
  ];

  const chip = `chip chip-${vendor.status.toLowerCase().replace(" ", "-")}`;

  return (
    <div className="page">
      <div className="new-page-head">
        <Link href="/admin/vendors" className="btn-outline btn-icon" aria-label="Back to vendors">
          <Icon name="back" size={16} />
        </Link>
        <h1 className="new-page-title">{vendor.name}</h1>
        <span className="tbl-id">{vendor.id}</span>
        <span className={chip}>
          <span className="chip-dot" />
          {vendor.status}
        </span>
        <VendorActions vendor={vendor} />
      </div>

      <section className="kpi-card">
        <dl className="kpi-row">
          {kpis.map((k) => (
            <div key={k.label} className="kpi">
              <dt>{k.label}</dt>
              <dd>{k.value}</dd>
            </div>
          ))}
        </dl>

        <AiBrief title="Vendor brief" points={points} />
      </section>

      <VendorTabs vendor={vendor} />
    </div>
  );
}
