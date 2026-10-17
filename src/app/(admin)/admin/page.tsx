import "@/styles/sourcing.css";
import "@/styles/dashboard.css";
import { DashboardHome } from "@/features/dashboard/components/DashboardHome";

export default function AdminDashboard() {
  return (
    <div className="page">
      <DashboardHome />
    </div>
  );
}
