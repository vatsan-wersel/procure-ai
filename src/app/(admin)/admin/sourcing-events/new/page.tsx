import Link from "next/link";
import "@/styles/sourcing.css";
import { Icon } from "@/components/layout/icons";
import { RequisitionForm } from "@/features/sourcing/components/RequisitionForm";
import { UploadDropzone } from "@/features/sourcing/components/UploadDropzone";

export default function NewSourcingEventPage() {
  return (
    <div className="page">
      <div className="new-page-head">
        <Link href="/admin/sourcing-events" className="btn-outline" aria-label="Back to sourcing events">
          <Icon name="back" size={16} />
          Back
        </Link>
        <h1 className="new-page-title">New sourcing event</h1>
      </div>

      <UploadDropzone />
      <RequisitionForm />
    </div>
  );
}
