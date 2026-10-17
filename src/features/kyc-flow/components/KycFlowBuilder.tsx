"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { addVersion, DEFAULT_SCOPE, latest, loadStore, removeScope, saveStore, stepsForScope, type FlowStore } from "../flowStore";
import "../kyc-flow.css";
import {
  defaultDescription,
  newStep,
  reviewerRoles,
  stepTypeList,
  stepTypes,
  validateFlow,
  vendorCategories,
  type FieldDef,
  type FieldKind,
  type FlowStep,
  type StepTypeId,
} from "../stepTypes";

const labelToType = Object.fromEntries(stepTypeList.map((t) => [t.label, t.id])) as Record<string, StepTypeId>;
const defaultLabel = "Default (all categories)";
const ownSuffix = " · own flow";

const kindLabel: Record<FieldKind, string> = {
  text: "Short text",
  textarea: "Long text",
  select: "Dropdown",
  date: "Date",
  yesno: "Yes / No",
  file: "File upload",
};
const kindsFor: Record<string, FieldKind[]> = {
  field: ["text", "textarea", "select", "date", "yesno"],
  document: ["file"],
  question: ["yesno", "text"],
  check: ["yesno", "select"],
};
const labelToKind = Object.fromEntries(Object.entries(kindLabel).map(([k, v]) => [v, k])) as Record<string, FieldKind>;
const flagChoices = ["Never", "Yes", "No"] as const;

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function KycFlowBuilder() {
  const [store, setStore] = useState<FlowStore>({});
  const [scope, setScope] = useState(DEFAULT_SCOPE);
  const [steps, setSteps] = useState<FlowStep[]>(() => stepsForScope({}, DEFAULT_SCOPE));
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [newType, setNewType] = useState<StepTypeId>("DOCUMENTS");

  useEffect(() => {
    const s = loadStore();
    setStore(s);
    setSteps(stepsForScope(s, DEFAULT_SCOPE));
  }, []);

  const history = store[scope] ?? [];
  const hasOwn = history.length > 0;
  const scopeOptions = useMemo(
    () => [defaultLabel, ...vendorCategories.map((c) => (store[c]?.length ? c + ownSuffix : c))],
    [store],
  );
  const scopeLabel = scope === DEFAULT_SCOPE ? defaultLabel : scope + (hasOwn ? ownSuffix : "");

  const update = (next: FlowStep[]) => {
    setSteps(next);
    setDirty(true);
    setErrors([]);
    setNotice("");
  };
  const patch = (id: string, p: Partial<FlowStep>) => update(steps.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...steps];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    update(next);
  };

  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Discard them?");

  const switchScope = (label: string) => {
    const next = label === defaultLabel ? DEFAULT_SCOPE : label.replace(ownSuffix, "");
    if (next === scope || !confirmDiscard()) return;
    setScope(next);
    setSteps(stepsForScope(store, next));
    setDirty(false);
    setErrors([]);
    setNotice("");
  };

  const changeType = (s: FlowStep, type: StepTypeId) => {
    if (type === s.type) return;
    const old = stepTypes[s.type];
    const t = stepTypes[type];
    patch(s.id, {
      type,
      fields: t.fields.map((f) => ({ ...f })),
      title: s.title === old.label ? t.label : s.title,
      description: s.description === defaultDescription[s.type] ? defaultDescription[type] : s.description,
      reviewer: t.mode === "internal" ? (s.reviewer ?? reviewerRoles[0]) : undefined,
    });
  };

  const save = () => {
    const found = validateFlow(steps);
    if (found.length) {
      setErrors(found);
      setNotice("");
      return;
    }
    // Prototype: no backend yet. This keeps the flow in this browser so the vendor portal can read it.
    const next = addVersion(store, scope, steps, "Admin");
    if (!saveStore(next)) {
      setErrors(["This browser blocked saving. Allow site storage and try again."]);
      return;
    }
    setStore(next);
    setDirty(false);
    setErrors([]);
    setNotice(`Saved as version ${latest(next, scope)!.version}. Vendors ${scope === DEFAULT_SCOPE ? "" : `in ${scope} `}now see this flow.`);
  };

  const restore = (v: (typeof history)[number]) => {
    if (!confirmDiscard()) return;
    setSteps(structuredClone(v.steps));
    setDirty(true);
    setErrors([]);
    setNotice(`Loaded version ${v.version}. Save to publish it as a new version.`);
  };

  const dropOwnFlow = () => {
    if (!window.confirm(`Remove the ${scope} flow? Vendors in this category go back to the default flow.`)) return;
    const next = removeScope(store, scope);
    saveStore(next);
    setStore(next);
    setSteps(stepsForScope(next, scope));
    setDirty(false);
    setNotice(`${scope} now uses the default flow.`);
  };

  const vendorSteps = steps.filter((s) => stepTypes[s.type].mode !== "internal");

  return (
    <div className="page">
      <section className="vp-card">
        <header className="vp-head">
          <h2>Vendor onboarding flow</h2>
          <p>Build the steps a vendor completes during KYC. Each step type collects data in its own way.</p>
        </header>

        <div className="kyc-scope">
          <div className="fcell">
            <label className="fcell-label" htmlFor="kyc-scope">
              Flow for
            </label>
            <Dropdown id="kyc-scope" value={scopeLabel} onChange={switchScope} options={scopeOptions} />
          </div>
          <p className="kyc-scope-note">
            {scope === DEFAULT_SCOPE
              ? "Used for every vendor category that doesn't have its own flow."
              : hasOwn
                ? `${scope} vendors get this flow instead of the default.`
                : `${scope} vendors use the default flow. Save to give them their own.`}
            {hasOwn && scope !== DEFAULT_SCOPE && (
              <>
                {" "}
                <button type="button" className="kyc-link" onClick={dropOwnFlow}>
                  Use the default flow instead
                </button>
              </>
            )}
          </p>
        </div>

        <ol className="kyc-builder-list">
          {steps.map((s, i) => (
            <StepEditor
              key={s.id}
              step={s}
              index={i}
              count={steps.length}
              onPatch={(p) => patch(s.id, p)}
              onType={(t) => changeType(s, t)}
              onMove={(d) => move(i, d)}
              onRemove={() => update(steps.filter((x) => x.id !== s.id))}
            />
          ))}
        </ol>

        <div className="kyc-add-row">
          <div className="kyc-add-type">
            <Dropdown value={stepTypes[newType].label} onChange={(l) => setNewType(labelToType[l])} options={stepTypeList.map((t) => t.label)} />
          </div>
          <button type="button" className="btn-outline" onClick={() => update([...steps, newStep(newType)])}>
            + Add step
          </button>
        </div>

        {errors.length > 0 && (
          <div className="kyc-errors" role="alert">
            <strong>Fix these before saving</strong>
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-solid" onClick={save} disabled={!dirty && hasOwn}>
            Save flow
          </button>
          <span className="kyc-summary">
            {vendorSteps.length} vendor {vendorSteps.length === 1 ? "step" : "steps"}
            {steps.length > vendorSteps.length && ` · ${steps.length - vendorSteps.length} internal`}
            {dirty && " · unsaved changes"}
          </span>
        </div>
        {notice && <p className="fhint">{notice}</p>}
      </section>

      {history.length > 0 && (
        <section className="vp-card">
          <header className="vp-head">
            <h2>Version history</h2>
            <p>Every save is kept. Restore an older version to edit and publish it again.</p>
          </header>
          <ul className="kyc-history">
            {[...history].reverse().map((v, i) => (
              <li key={v.version}>
                <span>
                  <strong>Version {v.version}</strong>
                  {i === 0 && <span className="kyc-live">Live</span>}
                  <small>
                    {when(v.savedAt)} · {v.savedBy} · {v.steps.length} steps
                  </small>
                </span>
                {i > 0 && (
                  <button type="button" className="btn-outline" onClick={() => restore(v)}>
                    Restore
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

type StepEditorProps = {
  step: FlowStep;
  index: number;
  count: number;
  onPatch: (p: Partial<FlowStep>) => void;
  onType: (t: StepTypeId) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
};

function StepEditor({ step: s, index: i, count, onPatch, onType, onMove, onRemove }: StepEditorProps) {
  const type = stepTypes[s.type];
  const internal = type.mode === "internal";
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const noun = type.fieldNoun;

  const setField = (key: string, p: Partial<FieldDef>) => onPatch({ fields: s.fields.map((f) => (f.key === key ? { ...f, ...p } : f)) });
  const moveField = (idx: number, dir: -1 | 1) => {
    const next = [...s.fields];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    onPatch({ fields: next });
  };
  const addField = () => {
    const kind = kindsFor[noun][0];
    const key = `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    onPatch({
      fields: [...s.fields, { key, label: "", kind, required: noun !== "field", custom: true, wide: noun !== "field", ...(kind === "file" ? { expiry: true } : {}) }],
    });
    setOpen(true);
  };

  const requiredCount = s.fields.filter((f) => f.required).length;
  const scoped = s.fields.filter((f) => f.categories?.length).length;

  const preview = s.fields.slice(0, 4);

  return (
    <li className="kyc-step">
      <header className="kyc-step-top">
        <span className="kyc-step-num">{i + 1}</span>
        <input
          className="kyc-step-title"
          aria-label="Step title"
          placeholder="Step title"
          value={s.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
        <div className="kyc-builder-actions">
          {confirming ? (
            <>
              <span className="kyc-confirm">Remove this step?</span>
              <button type="button" onClick={() => setConfirming(false)}>
                Keep
              </button>
              <button type="button" className="is-danger" onClick={onRemove}>
                Remove
              </button>
            </>
          ) : (
            <>
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => onMove(-1)}>
                ↑
              </button>
              <button type="button" aria-label="Move down" disabled={i === count - 1} onClick={() => onMove(1)}>
                ↓
              </button>
              <button type="button" disabled={count === 1} onClick={() => setConfirming(true)}>
                Remove
              </button>
            </>
          )}
        </div>
      </header>

      <div className="kyc-step-body">
        {internal ? (
          <p className="kyc-internal">Internal step. Vendors never see it, our team completes it before approving the vendor.</p>
        ) : (
          <div className="fcell">
            <label className="fcell-label" htmlFor={`d-${s.id}`}>
              Instruction shown to vendor
            </label>
            <input id={`d-${s.id}`} className="finput" value={s.description} onChange={(e) => onPatch({ description: e.target.value })} />
          </div>
        )}

        <div className="kyc-settings">
          <div className="fcell">
            <label className="fcell-label" htmlFor={`k-${s.id}`}>
              Data collection
            </label>
            <Dropdown id={`k-${s.id}`} value={type.label} onChange={(l) => onType(labelToType[l])} options={stepTypeList.map((t) => t.label)} />
          </div>
          <div className="fcell">
            <span className="fcell-label">Shown to</span>
            <CategoryPicker value={s.categories} onChange={(c) => onPatch({ categories: c })} />
          </div>
          {internal ? (
            <div className="fcell">
              <label className="fcell-label" htmlFor={`r-${s.id}`}>
                Completed by
              </label>
              <Dropdown id={`r-${s.id}`} value={s.reviewer ?? reviewerRoles[0]} onChange={(r) => onPatch({ reviewer: r })} options={reviewerRoles} />
            </div>
          ) : (
            <div className="fcell">
              <span className="fcell-label">Vendor must complete</span>
              <label className="kyc-switch">
                <input type="checkbox" role="switch" checked={s.required} onChange={(e) => onPatch({ required: e.target.checked })} />
                <i aria-hidden="true" />
                <span>{s.required ? "Required to submit" : "Optional"}</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <footer className="kyc-step-foot">
        <div className="kyc-step-sum">
          <strong>
            {s.fields.length} {noun}
            {s.fields.length === 1 ? "" : "s"}
          </strong>
          <span>
            {[type.mode === "list" ? "Repeatable" : "", requiredCount ? `${requiredCount} required` : "", scoped ? `${scoped} category-specific` : ""]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <div className="kyc-chips">
            {preview.map((f) => (
              <span key={f.key}>{f.label || "Untitled"}</span>
            ))}
            {s.fields.length > preview.length && <span className="is-more">+{s.fields.length - preview.length} more</span>}
          </div>
        </div>
        <button type="button" className="btn-outline kyc-edit-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Done" : `Edit ${noun}s`}
        </button>
      </footer>

      {open && (
        <div className="kyc-fields">
          {s.fields.map((f, idx) => (
            <FieldRow
              key={f.key}
              field={f}
              noun={noun}
              internal={internal}
              first={idx === 0}
              last={idx === s.fields.length - 1}
              onPatch={(p) => setField(f.key, p)}
              onMove={(d) => moveField(idx, d)}
              onRemove={() => onPatch({ fields: s.fields.filter((x) => x.key !== f.key) })}
            />
          ))}
          <button type="button" className="btn-outline kyc-add-field" onClick={addField}>
            + Add {noun}
          </button>
        </div>
      )}
    </li>
  );
}

type FieldRowProps = {
  field: FieldDef;
  noun: string;
  internal: boolean;
  first: boolean;
  last: boolean;
  onPatch: (p: Partial<FieldDef>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
};

function FieldRow({ field: f, noun, internal, first, last, onPatch, onMove, onRemove }: FieldRowProps) {
  const kinds = kindsFor[noun];
  const id = `f-${f.key}`;
  return (
    <div className="kyc-field">
      <div className="kyc-field-main">
        <div className="fcell kyc-field-label">
          <label className="fcell-label" htmlFor={id}>
            {noun.charAt(0).toUpperCase() + noun.slice(1)}
          </label>
          <input id={id} className="finput" value={f.label} placeholder={`Name this ${noun}`} onChange={(e) => onPatch({ label: e.target.value })} />
        </div>
        <div className="fcell kyc-field-kind">
          <span className="fcell-label">Type</span>
          {f.custom && kinds.length > 1 ? (
            <Dropdown
              value={kindLabel[f.kind]}
              onChange={(l) => onPatch({ kind: labelToKind[l], ...(labelToKind[l] === "select" && !f.options?.length ? { options: ["Option 1", "Option 2"] } : {}) })}
              options={kinds.map((k) => kindLabel[k])}
            />
          ) : (
            <span className="kyc-kind">{kindLabel[f.kind]}</span>
          )}
        </div>
        <div className="kyc-field-actions">
          <button type="button" aria-label={`Move ${noun} up`} disabled={first} onClick={() => onMove(-1)}>
            ↑
          </button>
          <button type="button" aria-label={`Move ${noun} down`} disabled={last} onClick={() => onMove(1)}>
            ↓
          </button>
          <button type="button" aria-label={`Remove ${noun}`} onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>

      <div className="kyc-field-opts">
        <label className="kyc-check">
          <input type="checkbox" checked={!!f.required} onChange={(e) => onPatch({ required: e.target.checked })} />
          Required
        </label>
        {f.kind === "file" && (
          <label className="kyc-check">
            <input type="checkbox" checked={!!f.expiry} onChange={(e) => onPatch({ expiry: e.target.checked })} />
            Ask for expiry date
          </label>
        )}
        {f.kind === "yesno" && !internal && (
          <span className="kyc-flagpick">
            Extra review when answer is
            <Dropdown value={f.flagOn ?? "Never"} onChange={(v) => onPatch({ flagOn: v === "Never" ? undefined : (v as "Yes" | "No") })} options={flagChoices} />
          </span>
        )}
        {!internal && (
          <div className="kyc-meta-cats">
            <span className="kyc-meta-label">Shown to</span>
            <CategoryPicker value={f.categories} onChange={(c) => onPatch({ categories: c })} />
          </div>
        )}
      </div>

      {f.kind === "select" && (
        <div className="fcell">
          <label className="fcell-label" htmlFor={`${id}-o`}>
            Options, separated by commas
          </label>
          <input
            id={`${id}-o`}
            className="finput"
            defaultValue={(f.options ?? []).join(", ")}
            onBlur={(e) =>
              onPatch({
                options: e.target.value
                  .split(",")
                  .map((o) => o.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function CategoryPicker({ value, onChange }: { value?: string[]; onChange: (c: string[] | undefined) => void }) {
  const picked = value ?? [];
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (c: string) => {
    const next = picked.includes(c) ? picked.filter((x) => x !== c) : [...picked, c];
    onChange(next.length ? next : undefined);
  };

  const label =
    picked.length === 0 ? "All categories" : picked.length <= 2 ? picked.join(", ") : `${picked.length} categories`;

  return (
    <div className="kyc-cat" ref={root}>
      <button
        ref={trigger}
        type="button"
        className={picked.length ? "kyc-cat-btn is-limited" : "kyc-cat-btn"}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="kyc-cat-pop" role="group" aria-label="Vendor categories">
          <label className="kyc-cat-row is-all">
            <input type="checkbox" checked={picked.length === 0} onChange={() => onChange(undefined)} />
            <span>All categories</span>
          </label>
          <div className="kyc-cat-list">
            {vendorCategories.map((c) => (
              <label key={c} className="kyc-cat-row">
                <input type="checkbox" checked={picked.includes(c)} onChange={() => toggle(c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <footer className="kyc-cat-foot">
            <span>{picked.length === 0 ? "Every vendor sees this" : `${picked.length} of ${vendorCategories.length} selected`}</span>
            <button type="button" className="kyc-link" onClick={() => setOpen(false)}>
              Done
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
