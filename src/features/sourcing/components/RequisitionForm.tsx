"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "@/components/layout/icons";
import { Dropdown } from "@/components/ui/Dropdown";

const MAX_TITLE_WORDS = 90;
const teams = ["Procurement", "Operations", "Engineering", "Finance", "IT", "Legal & Compliance", "Facilities"];
// Prototype data — replace with approvers from the directory.
const approvers = ["Priya Shah", "Aisha Okafor", "Jonas Reid", "Daniel Mercer"];
const urgencies = ["Low", "Medium", "High", "Critical"] as const;
const units = ["pcs", "set", "kg", "m", "L", "hr", "lot"];

type LineItem = {
  id: number;
  name: string;
  spec: string;
  qty: string;
  unit: string;
  price: string;
  need: string;
};

const wordCount = (v: string) => (v.trim() ? v.trim().split(/\s+/).length : 0);

export function RequisitionForm() {
  const router = useRouter();
  const nextId = useRef(2);
  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("");
  const [approver, setApprover] = useState("");
  const [urgency, setUrgency] = useState<(typeof urgencies)[number]>("Medium");
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, name: "", spec: "", qty: "", unit: "pcs", price: "", need: "" },
  ]);

  const nextDocId = useRef(2);
  const [docTypes, setDocTypes] = useState([{ id: 1, name: "" }]);

  const onTitle =(v: string) => {
    const words = v.trim() ? v.trim().split(/\s+/) : [];
    setTitle(words.length > MAX_TITLE_WORDS ? words.slice(0, MAX_TITLE_WORDS).join(" ") : v);
  };

  const patch = (id: number, key: keyof LineItem, value: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)));

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: nextId.current++, name: "", spec: "", qty: "", unit: "pcs", price: "", need: "" },
    ]);

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        router.push("/admin/sourcing-events");
      }}
    >
      <div className="frow">
        <label className="frow-label" htmlFor="title">
          Title
        </label>
        <div className="frow-field">
          <textarea
            id="title"
            className="ftext"
            rows={3}
            required
            placeholder="Describe what you need to source"
            value={title}
            onChange={(e) => onTitle(e.target.value)}
          />
          <p className="fhint">
            {wordCount(title)} / {MAX_TITLE_WORDS} words
          </p>
        </div>
      </div>

      <div className="frow">
        <label className="frow-label" htmlFor="team">
          Requested team
        </label>
        <div className="frow-field">
          <Dropdown id="team" required searchable value={team} onChange={setTeam} options={teams} placeholder="Select a team" />
        </div>
      </div>

      <div className="frow">
        <label className="frow-label" htmlFor="value">
          Estimated value
        </label>
        <div className="frow-field">
          <div className="fprefix">
            <span>$</span>
            <input id="value" className="finput" inputMode="decimal" required placeholder="0.00" />
          </div>
        </div>
      </div>

      <div className="frow">
        <label className="frow-label" htmlFor="closing">
          Bid closing date
        </label>
        <div className="frow-field">
          <input id="closing" type="date" className="finput fshort" required />
        </div>
      </div>

      <div className="frow">
        <span className="frow-label">Urgency</span>
        <div className="frow-field">
          <div className="radio-pills" role="radiogroup" aria-label="Urgency">
            {urgencies.map((u) => (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={urgency === u}
                className={urgency === u ? "radio-pill is-on" : "radio-pill"}
                onClick={() => setUrgency(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="frow frow-wide">
        <span className="frow-label">Line items</span>
        <div className="frow-field">
          <div className="li-table">
            {items.map((it, i) => (
              <div key={it.id} className="li-card">
                <div className="li-card-head">
                  <span className="li-num">Item {i + 1}</span>
                  <button
                    type="button"
                    className="icon-action"
                    aria-label={`Remove item ${i + 1}`}
                    disabled={items.length === 1}
                    onClick={() => removeItem(it.id)}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
                <div className="li-grid">
                  <label className="li-f li-name">
                    <span>Item name</span>
                    <input
                      className="finput"
                      required
                      placeholder="e.g. Industrial safety gloves"
                      value={it.name}
                      onChange={(e) => patch(it.id, "name", e.target.value)}
                    />
                  </label>
                  <label className="li-f li-spec">
                    <span>Specification</span>
                    <input
                      className="finput"
                      placeholder="Size, grade, material, standards…"
                      value={it.spec}
                      onChange={(e) => patch(it.id, "spec", e.target.value)}
                    />
                  </label>
                  <label className="li-f">
                    <span>Qty</span>
                    <input
                      className="finput"
                      type="number"
                      min="0"
                      required
                      placeholder="0"
                      value={it.qty}
                      onChange={(e) => patch(it.id, "qty", e.target.value)}
                    />
                  </label>
                  <div className="li-f">
                    <span>Unit</span>
                    <Dropdown value={it.unit} onChange={(v) => patch(it.id, "unit", v)} options={units} />
                  </div>
                  <label className="li-f">
                    <span>Target price</span>
                    <div className="fprefix">
                      <span>$</span>
                      <input
                        className="finput"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={it.price}
                        onChange={(e) => patch(it.id, "price", e.target.value)}
                      />
                    </div>
                  </label>
                  <label className="li-f">
                    <span>Need by</span>
                    <input
                      className="finput"
                      type="date"
                      value={it.need}
                      onChange={(e) => patch(it.id, "need", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn-outline li-add" onClick={addItem}>
            <Icon name="plus" size={16} />
            Add line item
          </button>
        </div>
      </div>

      <div className="frow">
        <label className="frow-label" htmlFor="description">
          Description
        </label>
        <div className="frow-field">
          <textarea
            id="description"
            className="ftext"
            rows={5}
            placeholder="Add scope, delivery terms or anything vendors should know"
          />
        </div>
      </div>

      <div className="frow">
        <span className="frow-label">Required documents</span>
        <div className="frow-field">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docTypes.map((d, i) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  className="finput"
                  required
                  aria-label={`Required document ${i + 1} type`}
                  placeholder="Document type name (e.g. Technical proposal)"
                  value={d.name}
                  onChange={(e) =>
                    setDocTypes((prev) => prev.map((x) => (x.id === d.id ? { ...x, name: e.target.value } : x)))
                  }
                />
                <button
                  type="button"
                  className="icon-action"
                  aria-label={`Remove document type ${i + 1}`}
                  disabled={docTypes.length === 1}
                  onClick={() => setDocTypes((prev) => prev.filter((x) => x.id !== d.id))}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-outline li-add"
            onClick={() => setDocTypes((prev) => [...prev, { id: nextDocId.current++, name: "" }])}
          >
            <Icon name="plus" size={16} />
            Add document type
          </button>
        </div>
      </div>

      <div className="frow">
        <label className="frow-label" htmlFor="approver">
          Approver <span className="fhint">(optional)</span>
        </label>
        <div className="frow-field">
          <Dropdown
            id="approver"
            searchable
            value={approver}
            onChange={setApprover}
            options={approvers}
            placeholder="Select an approver"
          />
          <p className="fhint">
            {approver
              ? "The event is published to vendors only after this approver approves it."
              : "Leave empty to publish to vendors without an approval step."}
          </p>
          {approver && (
            <button type="button" className="btn-outline li-add" onClick={() => setApprover("")}>
              Clear approver
            </button>
          )}
        </div>
      </div>

      <div className="form-actions">
        <Link href="/admin/sourcing-events" className="btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn-solid">
          Submit Requisition
        </button>
      </div>
    </form>
  );
}
