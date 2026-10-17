import { Icon } from "@/components/layout/icons";
import type { Vendor } from "@/features/vendors/data";
import { VendorKycWizard } from "@/features/kyc-flow/components/VendorKycWizard";
import { kycDocs, type KycStatus } from "../data";

const tone: Record<KycStatus, string> = { Verified: "is-ok", "In review": "is-warn", Missing: "is-bad", Expired: "is-bad" };

export function OnboardingKyc({ vendor }: { vendor: Vendor }) {
  const docs = kycDocs(vendor);

  return (
    <div className="page">
      <VendorKycWizard category={vendor.category} />

      <section className="vp-card">
        <header className="vp-head">
          <div>
            <h2>KYC documents</h2>
            <p>Documents we verify before you can be invited to bid.</p>
          </div>
        </header>
        <div className="vp-table" role="table" aria-label="KYC documents">
          <div role="row" className="vp-row vp-cols vp-colhead">
            <span role="columnheader">Document</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Valid until</span>
            <span role="columnheader" className="vp-right">
              Action
            </span>
          </div>
          {docs.map((d) => (
            <div key={d.name} role="row" className="vp-row vp-cols">
              <span role="cell">
                <strong>{d.name}</strong>
                <small>{d.note}</small>
              </span>
              <span role="cell">
                <span className={`vp-status ${tone[d.status]}`}>
                  <i />
                  {d.status}
                </span>
              </span>
              <span role="cell" className="vp-muted">
                {d.expiry}
              </span>
              <span role="cell" className="vp-right">
                <button type="button" className="btn-outline vp-btn">
                  <Icon name="upload" size={14} />
                  {d.status === "Verified" ? "Replace" : "Upload"}
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
