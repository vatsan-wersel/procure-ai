import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="center-page">
      <h1>Procure AI</h1>
      <p>Procurement made simple for vendors and admins.</p>
      <Link href="/login" className="btn btn-primary">
        Sign in
      </Link>
    </main>
  );
}
