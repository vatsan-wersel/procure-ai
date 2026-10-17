"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/layout/icons";
import type { OcrBlock, OcrDoc } from "../mockDocuments";

type Props = {
  name: string;
  group: string;
  bytes: number;
  /** Original file when it was uploaded in this session. */
  file?: File;
  /** Extracted text; absent when no OCR result exists. */
  ocr?: OcrDoc;
  onClose: () => void;
};

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
const isPlainText = (f?: File) => !!f && /\.(txt|csv)$/i.test(f.name);
const level = (c: number) => (c >= 95 ? "high" : c >= 90 ? "mid" : "low");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Highlights search matches inside plain text. */
function hl(text: string, q: string): ReactNode {
  if (!q) return text;
  return text.split(new RegExp(`(${escapeRe(q)})`, "gi")).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="ocr-hit">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Paragraph text: ⟦word⟧ marks low-confidence words. */
function paragraph(text: string, q: string): ReactNode {
  return text.split(/⟦(.*?)⟧/).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="ocr-low" title="Low OCR confidence — check against the original">
        {hl(part, q)}
      </mark>
    ) : (
      <Fragment key={i}>{hl(part, q)}</Fragment>
    ),
  );
}

const blockText = (b: OcrBlock) =>
  b.type === "heading" || b.type === "paragraph"
    ? b.text.replace(/[⟦⟧]/g, "")
    : b.type === "fields"
      ? b.items.map((i) => `${i.label} ${i.value}`).join(" ")
      : b.type === "image"
        ? [b.caption, b.summary, ...b.detected.map((d) => `${d.label} ${d.value}`), ...b.checks.map((c) => c.text)].join(" ")
        : [...b.columns, ...b.rows.flat()].join(" ");

function Illustration({ kind }: { kind: "vessel" | "certificate" }) {
  if (kind === "certificate") {
    return (
      <svg viewBox="0 0 320 170" role="img" aria-label="Scanned certificate">
        <rect x="70" y="10" width="180" height="150" rx="4" fill="#fff" stroke="#b9c3d9" />
        <rect x="80" y="20" width="160" height="130" rx="2" fill="none" stroke="#d3dbec" strokeDasharray="3 3" />
        <rect x="112" y="30" width="96" height="8" rx="2" fill="#8d9bb8" />
        <rect x="128" y="44" width="64" height="5" rx="2" fill="#c3cde2" />
        <circle cx="160" cy="84" r="20" fill="none" stroke="#2f6bf0" strokeWidth="2" />
        <circle cx="160" cy="84" r="13" fill="none" stroke="#2f6bf0" strokeWidth="1" />
        <path d="M153 84h14M160 77v14" stroke="#2f6bf0" strokeWidth="1.5" />
        <rect x="96" y="116" width="128" height="4" rx="2" fill="#c3cde2" />
        <rect x="96" y="126" width="100" height="4" rx="2" fill="#c3cde2" />
        <path d="M200 142c6-10 10 4 16-4s8 2 14-2" fill="none" stroke="#5a6b8c" strokeWidth="1.5" />
        <rect x="204" y="106" width="32" height="12" rx="2" fill="none" stroke="#d9534f" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label="Vessel general arrangement drawing">
      <g fill="none" stroke="#5a6b8c" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M30 104h250l-18 28H52z" fill="#fff" />
        <path d="M44 104V80h46v24" fill="#fff" />
        <path d="M54 80V66h26v14" fill="#fff" />
        <path d="M58 72h18M58 90h28" />
        <path d="M100 104h170" />
        <path d="M232 104V62l26-14" />
        <path d="M258 48l10 6" />
        <path d="M110 96h90v8M120 96v8M140 96v8M160 96v8M180 96v8" stroke="#8d9bb8" />
        <path d="M20 138q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0" stroke="#2f6bf0" strokeOpacity="0.5" />
      </g>
      <g stroke="#9aa6c0" strokeWidth="1" fill="none">
        <path d="M30 150h250M30 146v8M280 146v8" />
        <path d="M296 104v28M292 104h8M292 132h8" />
      </g>
      <g fontSize="9" fill="#5a6b8c" fontFamily="ui-sans-serif, system-ui">
        <text x="155" y="162" textAnchor="middle">LOA 82.4 m</text>
        <text x="300" y="122" textAnchor="start" transform="rotate(90 300 122)">BEAM 17.0 m</text>
      </g>
    </svg>
  );
}

function Block({ block, q }: { block: OcrBlock; q: string }) {
  switch (block.type) {
    case "image":
      return (
        <figure className="ocr-image">
          <div className="ocr-image-frame">
            <Illustration kind={block.kind} />
          </div>
          <figcaption className="ocr-image-caption">{hl(block.caption, q)}</figcaption>

          <div className="ocr-ai">
            <p className="ocr-ai-head">
              <span className="ocr-ai-chip">
                <Icon name="sparkles" size={13} />
              </span>
              Read by AI from the image
            </p>
            <p className="ocr-ai-summary">{hl(block.summary, q)}</p>

            <dl className="ocr-ai-detected">
              {block.detected.map((d) => (
                <div key={d.label}>
                  <dt>{hl(d.label, q)}</dt>
                  <dd>{hl(d.value, q)}</dd>
                </div>
              ))}
            </dl>

            <ul className="ocr-ai-checks">
              {block.checks.map((c) => (
                <li key={c.text} className={c.ok ? "is-ok" : "is-warn"}>
                  <span className="ocr-ai-mark" aria-hidden="true">
                    {c.ok ? <Icon name="check" size={12} /> : "!"}
                  </span>
                  <span>{hl(c.text, q)}</span>
                </li>
              ))}
            </ul>
          </div>
        </figure>
      );
    case "heading":
      return <h4 className="ocr-h">{hl(block.text, q)}</h4>;
    case "paragraph":
      return <p className="ocr-p">{paragraph(block.text, q)}</p>;
    case "fields":
      return (
        <dl className="ocr-fields">
          {block.items.map((f) => (
            <div key={f.label}>
              <dt>{hl(f.label, q)}</dt>
              <dd>{hl(f.value, q)}</dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div className="ocr-table-wrap">
          <table className="ocr-table">
            <thead>
              <tr>
                {block.columns.map((c) => (
                  <th key={c}>{hl(c, q)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((cell, j) => (
                    <td key={j}>{hl(cell, q)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function OcrViewer({ name, group, bytes, file, ocr, onClose }: Props) {
  const [q, setQ] = useState("");
  const [text, setText] = useState<string | null>(null);
  const term = q.trim();

  // Plain-text uploads can be read as-is.
  useEffect(() => {
    let live = true;
    setText(null);
    if (!ocr && isPlainText(file)) file!.text().then((t) => live && setText(t));
    return () => {
      live = false;
    };
  }, [file, ocr]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stats = useMemo(() => {
    if (!ocr) return null;
    const avg = Math.round(ocr.pages.reduce((n, p) => n + p.confidence, 0) / ocr.pages.length);
    const review = ocr.pages.reduce(
      (n, p) => n + p.blocks.reduce((m, b) => m + (b.type === "paragraph" ? (b.text.match(/⟦/g) ?? []).length : 0), 0),
      0,
    );
    const images = ocr.pages.reduce((n, p) => n + p.blocks.filter((b) => b.type === "image").length, 0);
    return { avg, review, images };
  }, [ocr]);

  const matches = useMemo(() => {
    if (!ocr || !term) return 0;
    const re = new RegExp(escapeRe(term), "gi");
    return ocr.pages.reduce((n, p) => n + p.blocks.reduce((m, b) => m + (blockText(b).match(re) ?? []).length, 0), 0);
  }, [ocr, term]);

  const download = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ocr-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="ocr" role="dialog" aria-label={`OCR text of ${name}`}>
        <header className="ocr-head">
          <span className="ocr-file-icon">
            <Icon name="file" size={20} />
          </span>
          <div className="ocr-head-text">
            <h2 className="ocr-name">{name}</h2>
            <p className="ocr-sub">
              {group} · {size(bytes)}
            </p>
          </div>
          {file && (
            <button type="button" className="icon-action" aria-label="Download original" onClick={download}>
              <Icon name="download" size={18} />
            </button>
          )}
          <button type="button" className="icon-action" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        {ocr && stats ? (
          <>
            <div className="ocr-meta">
              <span className="ocr-pill">
                {ocr.pages.length} page{ocr.pages.length > 1 ? "s" : ""}
              </span>
              <span className="ocr-pill">{ocr.language}</span>
              <span className={`ocr-pill is-${level(stats.avg)}`}>
                <span className="ocr-pill-dot" />
                {stats.avg}% avg confidence
              </span>
              {stats.images > 0 && (
                <span className="ocr-pill is-ai">
                  <Icon name="sparkles" size={12} />
                  {stats.images} image{stats.images > 1 ? "s" : ""} read by AI
                </span>
              )}
              {stats.review > 0 && (
                <span className="ocr-pill is-review">
                  {stats.review} word{stats.review > 1 ? "s" : ""} to review
                </span>
              )}
            </div>

            <div className="ocr-search">
              <label className="search">
                <Icon name="search" size={16} />
                <input
                  type="search"
                  placeholder="Search in this document"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>
              {term && <span className="ocr-matches">{matches} match{matches === 1 ? "" : "es"}</span>}
            </div>

            <div className="ocr-body">
              {ocr.pages.map((p) => (
                <section key={p.n} className="ocr-page">
                  <header className="ocr-page-head">
                    <span className="ocr-page-no">Page {p.n}</span>
                    <span className={`ocr-conf is-${level(p.confidence)}`}>
                      <span className="ocr-conf-bar">
                        <span style={{ width: `${p.confidence}%` }} />
                      </span>
                      {p.confidence}% confidence
                    </span>
                  </header>
                  <div className="ocr-blocks">
                    {p.blocks.map((b, i) => (
                      <Block key={i} block={b} q={term} />
                    ))}
                  </div>
                </section>
              ))}
              {stats.review > 0 && (
                <p className="ocr-legend">
                  <mark className="ocr-low">Highlighted</mark> words were read with low confidence. Check them against the
                  original before relying on them.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="ocr-body">
            {isPlainText(file) ? (
              <pre className="ocr-text">{text ?? "Reading…"}</pre>
            ) : (
              <div className="ocr-pending">
                <span className="ocr-pending-icon">
                  <Icon name="sparkles" size={22} />
                </span>
                <p className="ocr-pending-title">OCR text isn&apos;t available yet</p>
                <p className="ocr-pending-text">
                  The OCR service isn&apos;t connected, so the extracted text of this document can&apos;t be shown. Once it
                  is, the text will appear here, page by page.
                </p>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
