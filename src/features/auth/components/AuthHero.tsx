import { SilkBackground } from "./SilkBackground";

// Placeholder partner marks — swap for real logos later.
const partners = [
  { name: "Northwind", mark: <path d="M12 3 3 21h18L12 3Z" /> },
  { name: "Petrolex", mark: <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11Z" /> },
  { name: "Aurum", mark: <circle cx="12" cy="12" r="8" /> },
  { name: "Vertex", mark: <path d="M4 5h16L12 20 4 5Z" /> },
  { name: "Helix", mark: <path d="M5 4h4v16H5zM15 4h4v16h-4zM9 10h6v4H9z" /> },
];

export function AuthHero() {
  return (
    <section className="auth-hero" aria-hidden="true">
      <SilkBackground className="auth-hero-bg" />

      <div className="auth-hero-copy">
        <h2 className="auth-hero-title">
          Procurement intelligence, built from the core.
        </h2>
      </div>

      <div className="auth-partners">
        <p className="auth-partners-label">Our partners</p>
        <div className="auth-marquee">
          <div className="auth-marquee-track">
            {[...partners, ...partners].map((p, i) => (
              <span key={i} className="auth-partner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  {p.mark}
                </svg>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
