import { Icon } from "@/components/layout/icons";
import type { EventStatus } from "../data";

// Prototype data — replace with governance records.
type Stage = { name: string; est: number; actual: string | null; actualDays: number | null };

const stages: Stage[] = [
  { name: "PR", est: 3, actual: null, actualDays: null },
  { name: "RFQ", est: 5, actual: "42 min", actualDays: 0.03 },
  { name: "Proposal", est: 14, actual: "1.6 h", actualDays: 0.07 },
  { name: "Evaluation", est: 20, actual: "< 1 min", actualDays: 0 },
  { name: "Report", est: 8, actual: "13 d", actualDays: 13 },
];

const completedByStatus: Record<EventStatus, number> = {
  Draft: 0,
  "Pending approval": 1,
  Evaluation: 3,
  Awarded: 5,
};

export function StageTracker({ status }: { status: EventStatus }) {
  const done = completedByStatus[status];
  const completed = stages.slice(0, done);
  const baseline = completed.reduce((n, s) => n + s.est, 0);
  const actual = completed.reduce((n, s) => n + (s.actualDays ?? 0), 0);
  const unrecorded = completed.filter((s) => s.actual === null).length;

  return (
    <section className="stracker">
      <header className="stracker-head">
        <h2 className="stracker-title">Stage tracker</h2>
        <p className="stracker-sub">Estimated vs actual, working days</p>
      </header>

      <ol className="stracker-track">
        {stages.map((s, i) => {
          const state = i < done ? "done" : i === done ? "current" : "todo";
          const over = s.actualDays !== null && s.actualDays > s.est;
          return (
            <li key={s.name} className={`stage is-${state}`}>
              <span className="stage-node" aria-hidden="true">
                {state === "done" && <Icon name="check" size={13} />}
                {state === "current" && <Icon name="clock" size={13} />}
              </span>
              <div className="stage-body">
                <p className="stage-name">
                  {s.name}
                  <span className="stage-state">
                    {state === "done" ? "Completed" : state === "current" ? "In progress" : "Not started"}
                  </span>
                </p>
                <p className="stage-meta">
                  est {s.est} d
                  {state === "done" && (
                    <>
                      {" · "}
                      <span className={over ? "stage-actual is-over" : "stage-actual"}>actual {s.actual ?? "—"}</span>
                    </>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="stracker-foot">
        Baseline <strong>{baseline} d</strong> · actual <strong>{Math.round(actual)} d</strong>
        {unrecorded > 0 && <span className="stracker-note"> · {unrecorded} not recorded</span>}
      </p>
    </section>
  );
}
