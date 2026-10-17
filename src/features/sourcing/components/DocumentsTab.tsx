"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { Dropdown } from "@/components/ui/Dropdown";
import { vendors } from "../data";
import { mockDocuments, type OcrDoc } from "../mockDocuments";
import { OcrViewer } from "./OcrViewer";
import { UploadDropzone } from "./UploadDropzone";

type Mode = "Tender" | "Bidder" | "All documents";
const modes: Mode[] = ["Tender", "Bidder", "All documents"];

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
const ext = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase() : "FILE");

type Item = { key: string; name: string; bytes: number; file?: File; ocr?: OcrDoc };
type Opened = Item & { group: string };

const imageCount = (item: Item) =>
  item.ocr?.pages.reduce((n, p) => n + p.blocks.filter((b) => b.type === "image").length, 0) ?? 0;

const fromFile = (f: File, i: number): Item => ({ key: `f-${f.name}-${i}`, name: f.name, bytes: f.size, file: f });

const save = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const ocrText = (ocr: OcrDoc) =>
  ocr.pages
    .map((p) =>
      p.blocks
        .map((b) => {
          if (b.type === "heading" || b.type === "paragraph") return b.text.replace(/[⟦⟧]/g, "");
          if (b.type === "fields") return b.items.map((i) => `${i.label}: ${i.value}`).join("\n");
          if (b.type === "table") return [b.columns, ...b.rows].map((r) => r.join(" | ")).join("\n");
          return b.caption;
        })
        .join("\n\n"),
    )
    .join("\n\n");

// Uploaded files download as-is. Prototype documents have no stored original, so
// they fall back to their extracted text — replace with the stored file from the backend.
const downloadOriginal = (item: Item) => {
  if (item.file) return save(item.file, item.file.name);
  save(new Blob([item.ocr ? ocrText(item.ocr) : ""], { type: "text/plain" }), `${item.name.replace(/\.[^.]+$/, "")}.txt`);
};

// Mock documents grouped like the real ones will be (prototype data).
const mockTender: Item[] = mockDocuments
  .filter((d) => d.group === "Tender")
  .map((d) => ({ key: d.id, name: d.name, bytes: d.bytes, ocr: d.ocr }));

const mockByVendor = mockDocuments
  .filter((d) => d.group !== "Tender")
  .reduce<Record<string, Item[]>>((acc, d) => {
    (acc[d.group] ??= []).push({ key: d.id, name: d.name, bytes: d.bytes, ocr: d.ocr });
    return acc;
  }, {});

export function DocumentsTab() {
  const [mode, setMode] = useState<Mode>("All documents");
  const [vendor, setVendor] = useState("");
  const [tenderFiles, setTenderFiles] = useState<File[]>([]);
  const [bidFiles, setBidFiles] = useState<Record<string, File[]>>({});
  const [opened, setOpened] = useState<Opened | null>(null);

  const tenderItems = [...mockTender, ...tenderFiles.map(fromFile)];
  const vendorNames = Array.from(new Set([...Object.keys(mockByVendor), ...Object.keys(bidFiles)]));
  const bidderGroups = vendorNames
    .map((name): [string, Item[]] => [name, [...(mockByVendor[name] ?? []), ...(bidFiles[name] ?? []).map(fromFile)]])
    .filter(([, items]) => items.length > 0);
  const bidTotal = bidderGroups.reduce((n, [, items]) => n + items.length, 0);
  const total = tenderItems.length + bidTotal;

  const row = (item: Item, group: string) => (
    <li key={item.key} className="doc-li">
      <button type="button" className="doc-row" onClick={() => setOpened({ ...item, group })}>
        <span className="doc-ext">{ext(item.name)}</span>
        <span className="doc-name">{item.name}</span>
        {imageCount(item) > 0 && (
          <span className="doc-ai">
            <Icon name="sparkles" size={12} />
            {imageCount(item)} image{imageCount(item) > 1 ? "s" : ""}
          </span>
        )}
        <span className="doc-size">{size(item.bytes)}</span>
        <span className="doc-open">
          OCR view
          <Icon name="right" size={14} />
        </span>
      </button>
      <button
        type="button"
        className="icon-action doc-download"
        aria-label={`Download original ${item.name}`}
        onClick={() => downloadOriginal(item)}
      >
        <Icon name="download" size={18} />
      </button>
    </li>
  );

  return (
    <div className="docs">
      <div className="docs-bar">
        <div className="segments" role="tablist" aria-label="Documents">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={mode === m ? "segment is-active" : "segment"}
              onClick={() => setMode(m)}
            >
              {m}
              {m === "All documents" && <span className="segment-count">{total}</span>}
            </button>
          ))}
        </div>

        {mode === "Bidder" && (
          <div className="docs-vendor">
            <Dropdown
              searchable
              value={vendor}
              onChange={setVendor}
              options={vendors}
              placeholder="Select a vendor"
            />
          </div>
        )}
      </div>

      {mode === "Tender" && (
        <UploadDropzone
          title="Upload tender documents"
          hint="RFP, specifications, terms and conditions · PDF, DOCX, XLSX, CSV · 10 MB max"
          files={tenderFiles}
          onFilesChange={setTenderFiles}
        />
      )}

      {mode === "Bidder" &&
        (vendor ? (
          <UploadDropzone
            title={`Upload bid documents for ${vendor}`}
            hint="Proposal, pricing, compliance certificates · PDF, DOCX, XLSX, CSV · 10 MB max"
            files={bidFiles[vendor] ?? []}
            onFilesChange={(f) => setBidFiles((prev) => ({ ...prev, [vendor]: f }))}
          />
        ) : (
          <p className="docs-empty">Select a vendor to upload or view their bid documents.</p>
        ))}

      {mode === "All documents" &&
        (total === 0 ? (
          <p className="docs-empty">No documents uploaded yet. Add tender or bidder documents to see them here.</p>
        ) : (
          <div className="doc-groups">
            {tenderItems.length > 0 && (
              <section className="doc-group">
                <h3 className="doc-group-title">
                  Tender documents <span className="doc-count">{tenderItems.length}</span>
                </h3>
                <ul className="doc-list">{tenderItems.map((it) => row(it, "Tender"))}</ul>
              </section>
            )}

            {bidderGroups.length > 0 && (
              <section className="doc-group">
                <h3 className="doc-group-title">
                  Bidder documents <span className="doc-count">{bidTotal}</span>
                </h3>
                {bidderGroups.map(([name, items]) => (
                  <div key={name} className="doc-vendor-group">
                    <h4 className="doc-vendor-title">
                      {name} <span className="doc-count">{items.length}</span>
                    </h4>
                    <ul className="doc-list">{items.map((it) => row(it, name))}</ul>
                  </div>
                ))}
              </section>
            )}
          </div>
        ))}

      {opened && (
        <OcrViewer
          name={opened.name}
          group={opened.group}
          bytes={opened.bytes}
          file={opened.file}
          ocr={opened.ocr}
          onClose={() => setOpened(null)}
        />
      )}
    </div>
  );
}
