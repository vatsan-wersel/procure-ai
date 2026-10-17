import "@/styles/auth.css";
import { AuthHero } from "@/features/auth/components/AuthHero";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <AuthHero />
        <section className="auth-form-side">
          <div className="auth-form-wrap">
            <h1 className="auth-title">Welcome, Login</h1>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
