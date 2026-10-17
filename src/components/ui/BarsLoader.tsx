export function BarsLoader({ size = 16, label }: { size?: number; label?: string }) {
  return (
    <span className="bars-loader" style={{ height: size }} role="status" aria-label={label ?? "Loading"}>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </span>
  );
}
