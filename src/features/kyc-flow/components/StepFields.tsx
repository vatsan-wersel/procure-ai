"use client";

import { useId } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import type { FieldDef, Record_ } from "../stepTypes";

type Props = {
  fields: FieldDef[];
  value: Record_;
  onChange: (next: Record_) => void;
};

/** Renders one record's worth of inputs from a field list. */
export function StepFields({ fields, value, onChange }: Props) {
  const uid = useId();
  const set = (key: string, v: string) => onChange({ ...value, [key]: v });

  return (
    <div className="fgrid">
      {fields.map((f) => {
        const id = `${uid}-${f.key}`;
        const v = value[f.key] ?? "";
        return (
          <div key={f.key} className={f.wide ? "fcell fcell-wide" : "fcell"}>
            <label className="fcell-label" id={`${id}-l`} htmlFor={id}>
              {f.label}
              {f.required && <span className="kyc-req" aria-hidden="true"> *</span>}
            </label>
            {f.kind === "select" ? (
              <Dropdown id={id} required={f.required} searchable={(f.options?.length ?? 0) > 8} value={v} onChange={(x) => set(f.key, x)} options={f.options ?? []} placeholder="Select" />
            ) : f.kind === "yesno" ? (
              <div className="kyc-yesno" role="radiogroup" aria-labelledby={`${id}-l`}>
                {["Yes", "No"].map((o) => (
                  <label key={o} className={v === o ? "is-on" : undefined}>
                    <input type="radio" name={id} value={o} required={f.required} checked={v === o} onChange={() => set(f.key, o)} />
                    {o}
                  </label>
                ))}
              </div>
            ) : f.kind === "file" ? (
              <div className="kyc-file">
                <label className="btn-outline kyc-file-btn" htmlFor={id}>
                  {v ? "Replace file" : "Choose file"}
                </label>
                <input
                  id={id}
                  className="kyc-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  required={f.required && !v}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) set(f.key, file.name);
                  }}
                />
                <span className="kyc-file-name">{v || "PDF, PNG or JPG · 10 MB max"}</span>
                {f.expiry && (
                  <span className="kyc-file-exp">
                    <label htmlFor={`${id}-exp`}>Valid until</label>
                    <input
                      id={`${id}-exp`}
                      className="finput"
                      type="date"
                      required={f.required}
                      value={value[`${f.key}__expiry`] ?? ""}
                      onChange={(e) => set(`${f.key}__expiry`, e.target.value)}
                    />
                  </span>
                )}
              </div>
            ) : f.kind === "textarea" ? (
              <textarea id={id} className="ftext" rows={2} required={f.required} placeholder={f.placeholder} value={v} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <input
                id={id}
                className="finput"
                type={f.kind === "date" ? "date" : "text"}
                required={f.required}
                pattern={f.pattern}
                title={f.hint}
                placeholder={f.placeholder}
                value={v}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
            {f.hint && <small className="fhint">{f.hint}</small>}
          </div>
        );
      })}
    </div>
  );
}
