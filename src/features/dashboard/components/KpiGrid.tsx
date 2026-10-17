import { getKpis, getPipeline } from "../queries";

export function KpiGrid() {
  const kpis = getKpis();
  const pipeline = getPipeline();
  const total = pipeline.reduce((s, p) => s + p.count, 0);

  return (
    <section aria-label="Key figures">
      <h2 className="dash-heading">Key figures</h2>
      <dl className="dash-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="dash-kpi">
            <dt>{k.label}</dt>
            <dd className={k.tone ? `is-${k.tone}` : undefined}>{k.value}</dd>
            <small>{k.sub}</small>
          </div>
        ))}
      </dl>

      <div className="dash-pipe">
        <p className="dash-pipe-title">Events by stage</p>
        <div className="dash-pipe-bar" role="img" aria-label={pipeline.map((p) => `${p.name} ${p.count}`).join(", ")}>
          {pipeline
            .filter((p) => p.count > 0)
            .map((p) => (
              <span key={p.name} style={{ flex: p.count, background: p.dot }}>
                {p.count}
              </span>
            ))}
        </div>
        <ul className="dash-pipe-legend">
          {pipeline.map((p) => (
            <li key={p.name}>
              <i style={{ background: p.dot }} />
              {p.name} {p.count}
            </li>
          ))}
          <li>Total {total}</li>
        </ul>
      </div>
    </section>
  );
}
