import "@/styles/sourcing.css";
import { VendorTable } from "@/features/vendors/components/VendorTable";
import { VendorBrief } from "@/features/vendors/components/VendorBrief";

// Prototype numbers — replace with database counts.
const kpis = [
  { label: "Total vendors", value: "12" },
  { label: "Approved", value: "9" },
  { label: "Under review", value: "2" },
  { label: "Documents expiring in 60 days", value: "3" },
];

export default function VendorsPage() {
  return (
    <div className="page">
      <section className="kpi-card">
        <dl className="kpi-row">
          {kpis.map((k) => (
            <div key={k.label} className="kpi">
              <dt>{k.label}</dt>
              <dd>{k.value}</dd>
            </div>
          ))}
        </dl>

        <VendorBrief />
      </section>

      <VendorTable />
    </div>
  );
}
