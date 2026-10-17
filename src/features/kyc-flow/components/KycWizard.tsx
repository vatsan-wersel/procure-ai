"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/layout/icons";
import "../kyc-flow.css";
import { flowForVendor, stepTypes, type FieldDef, type FlowStep, type Record_, type StepAnswers } from "../stepTypes";
import { StepFields } from "./StepFields";

type Props = { flow: FlowStep[]; /** The vendor's category, used to hide steps and fields that don't apply. */ category?: string };

const isList = (step: FlowStep) => stepTypes[step.type].mode === "list";
const flagged = (f: FieldDef, r: Record_) => !!f.flagOn && r[f.key] === f.flagOn;

export function KycWizard({ flow: fullFlow, category }: Props) {
  const flow = useMemo(() => flowForVendor(fullFlow, category), [fullFlow, category]);
  const [answers, setAnswers] = useState<StepAnswers>({});
  const [done, setDone] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const stepperRef = useRef<HTMLOListElement>(null);

  // Keep the active step centred in the scrollable stepper.
  useEffect(() => {
    const el = stepperRef.current?.children[current] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [current]);

  const step = flow[current];
  const reviewing = current >= flow.length;
  const reviewFlags = flow.reduce(
    (n, s) => n + (done.has(s.id) ? (answers[s.id] ? ([] as Record_[]).concat(answers[s.id]).reduce((m, r) => m + s.fields.filter((f) => flagged(f, r)).length, 0) : 0) : 0),
    0,
  );
  const skippable = (s: FlowStep) => !s.required && !done.has(s.id);

  const recordsOf = (s: FlowStep): Record_[] => {
    const a = answers[s.id];
    return Array.isArray(a) ? a : a ? [a] : [];
  };

  const saveStep = (s: FlowStep, value: Record_ | Record_[]) => setAnswers((p) => ({ ...p, [s.id]: value }));

  const complete = (s: FlowStep) => {
    setDone((p) => new Set(p).add(s.id));
    setCurrent((c) => c + 1);
  };

  if (submitted) {
    return (
      <section className="vp-card">
        <header className="vp-head">
          <h2>Onboarding submitted</h2>
          <p>
            Thanks — procurement will verify your details and email you when your account is approved.
            {reviewFlags > 0 && ` ${reviewFlags} ${reviewFlags === 1 ? "answer was" : "answers were"} sent for extra review, which can add a few days.`}
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="vp-card">
      <header className="vp-head">
        <h2>Onboarding</h2>
        <p>
          {done.size} of {flow.length} steps complete
        </p>
      </header>

      <ol className="vp-steps kyc-stepper" ref={stepperRef}>
        {[...flow.map((s) => s.title), "Review & submit"].map((title, i) => {
          const isDone = i < flow.length && done.has(flow[i].id);
          const state = isDone ? "is-complete" : i === current ? "is-in-progress" : "";
          return (
            <li key={title} className={`vp-step ${state}`}>
              <button type="button" className="kyc-step-btn" disabled={i > current && !isDone} onClick={() => setCurrent(i)}>
                <span className="vp-step-n">{isDone ? <Icon name="check" size={14} /> : i + 1}</span>
                <span>
                  <strong>{title}</strong>
                  <small>{isDone ? "Complete" : i === current ? "In progress" : "Not started"}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="kyc-body">
        {reviewing ? (
          <Review
            flow={flow}
            recordsOf={recordsOf}
            done={done}
            onEdit={setCurrent}
            onBack={() => setCurrent(flow.length - 1)}
            onSubmit={() => setSubmitted(true)}
          />
        ) : isList(step) ? (
          <ListStep key={step.id} step={step} initial={recordsOf(step)} skippable={skippable(step)} onBack={current > 0 ? () => setCurrent(current - 1) : undefined} onSave={(v) => { saveStep(step, v); complete(step); }} />
        ) : (
          <FormStep key={step.id} step={step} initial={recordsOf(step)[0] ?? {}} skippable={skippable(step)} onBack={current > 0 ? () => setCurrent(current - 1) : undefined} onSave={(v) => { saveStep(step, v); complete(step); }} />
        )}
      </div>
    </section>
  );
}

type StepProps<T> = { step: FlowStep; initial: T; skippable: boolean; onBack?: () => void; onSave: (v: T) => void };

function StepHead({ step }: { step: FlowStep }) {
  return (
    <div className="kyc-step-head">
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </div>
  );
}

function Actions({ onBack, skip, submitLabel }: { onBack?: () => void; skip?: () => void; submitLabel: string }) {
  return (
    <div className="form-actions">
      {onBack && (
        <button type="button" className="btn-outline" onClick={onBack}>
          Back
        </button>
      )}
      {skip && (
        <button type="button" className="btn-outline" onClick={skip}>
          Skip for now
        </button>
      )}
      <button type="submit" className="btn-solid">
        {submitLabel}
      </button>
    </div>
  );
}

/** Single-record step (registration, country details). */
function FormStep({ step, initial, skippable, onBack, onSave }: StepProps<Record_>) {
  const [value, setValue] = useState(initial);
  const fields = step.fields;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value);
      }}
    >
      <StepHead step={step} />
      <StepFields fields={fields} value={value} onChange={setValue} />
      <Actions onBack={onBack} skip={skippable ? () => onSave({}) : undefined} submitLabel="Save & continue" />
    </form>
  );
}

/** Repeatable step (bank accounts): one or more records. */
function ListStep({ step, initial, skippable, onBack, onSave }: StepProps<Record_[]>) {
  const [items, setItems] = useState<Record_[]>(initial.length ? initial : [{}]);
  const type = stepTypes[step.type];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(items);
      }}
    >
      <StepHead step={step} />
      {items.map((item, i) => (
        <fieldset key={i} className="kyc-item">
          <legend>
            {type.itemLabel} {i + 1}
          </legend>
          {items.length > 1 && (
            <button type="button" className="kyc-remove" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}>
              Remove
            </button>
          )}
          <StepFields fields={step.fields} value={item} onChange={(next) => setItems((p) => p.map((x, j) => (j === i ? next : x)))} />
        </fieldset>
      ))}
      <button type="button" className="btn-outline kyc-add" onClick={() => setItems((p) => [...p, {}])}>
        + Add another {type.itemLabel?.toLowerCase()}
      </button>
      <Actions onBack={onBack} skip={skippable ? () => onSave([]) : undefined} submitLabel="Save & continue" />
    </form>
  );
}

function Review({
  flow,
  recordsOf,
  done,
  onEdit,
  onBack,
  onSubmit,
}: {
  flow: FlowStep[];
  recordsOf: (s: FlowStep) => Record_[];
  done: Set<string>;
  onEdit: (i: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const missing = flow.filter((s) => s.required && !done.has(s.id));
  return (
    <div>
      <div className="kyc-step-head">
        <h3>Review &amp; submit</h3>
        <p>Check your answers. You can edit any step before submitting.</p>
      </div>
      {flow.map((s, i) => {
        const records = recordsOf(s).filter((r) => Object.values(r).some(Boolean));
        return (
          <section key={s.id} className="kyc-review">
            <header>
              <strong>{s.title}</strong>
              <button type="button" className="kyc-link" onClick={() => onEdit(i)}>
                {done.has(s.id) ? "Edit" : "Fill in"}
              </button>
            </header>
            {records.length === 0 ? (
              <p className="vp-muted">{s.required ? "Not provided yet" : "Skipped"}</p>
            ) : (
              records.map((r, k) => (
                <dl key={k} className="kyc-dl">
                  {s.fields
                    .filter((f) => r[f.key])
                    .map((f) => (
                      <div key={f.key}>
                        <dt>{f.label}</dt>
                        <dd>
                          {r[f.key]}
                          {f.kind === "file" && r[`${f.key}__expiry`] && ` · valid until ${r[`${f.key}__expiry`]}`}
                          {flagged(f, r) && <span className="kyc-flag">Extra review</span>}
                        </dd>
                      </div>
                    ))}
                </dl>
              ))
            )}
          </section>
        );
      })}
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn-solid" disabled={missing.length > 0} onClick={onSubmit}>
          Submit for verification
        </button>
      </div>
      {missing.length > 0 && <p className="fhint">Complete required steps first: {missing.map((s) => s.title).join(", ")}.</p>}
    </div>
  );
}
