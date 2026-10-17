"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction } from "../actions/login";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="auth-form" noValidate>
      <div className="auth-field">
        <div className="auth-label-row">
          <label htmlFor="email" className="auth-label">
            Email address
          </label>
        </div>
        <input
          id="email"
          name="email"
          type="email"
          className="auth-input"
          placeholder="Enter your email ..."
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <div className="auth-label-row">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <Link href="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </div>
        <div className="auth-input-wrap">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="auth-input"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>
      </div>

      <label className="auth-check">
        <input type="checkbox" name="terms" />
        <span>
          I agree to the <Link href="/terms">Terms &amp; Privacy</Link>
        </span>
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" className="auth-submit" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="auth-footnote">
        Have an account?<Link href="/register">Sign up</Link>
      </p>
    </form>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}
