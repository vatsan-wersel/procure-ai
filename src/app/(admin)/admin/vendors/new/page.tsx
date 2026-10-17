import Link from "next/link";
import "@/styles/sourcing.css";
import { Icon } from "@/components/layout/icons";
import { VendorForm } from "@/features/vendors/components/VendorForm";

export default function NewVendorPage() {
  return (
    <div className="page">
      <div className="new-page-head">
        <Link href="/admin/vendors" className="btn-outline" aria-label="Back to vendors">
          <Icon name="back" size={16} />
          Back
        </Link>
        <h1 className="new-page-title">Add vendor</h1>
      </div>

      <VendorForm />
    </div>
  );
}
