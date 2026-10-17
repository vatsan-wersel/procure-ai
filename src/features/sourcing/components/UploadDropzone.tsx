"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/layout/icons";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt";

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

type Props = {
  title?: string;
  hint?: string;
  /** Controlled mode: pass both to keep the file list in the parent. */
  files?: File[];
  onFilesChange?: (files: File[]) => void;
};

export function UploadDropzone({
  title = "Attach an RFP / spec / requirement doc, or PR data",
  hint = "PDF, DOCX, XLSX, CSV · 10 MB max",
  files: controlled,
  onFilesChange,
}: Props = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [own, setOwn] = useState<File[]>([]);
  const files = controlled ?? own;
  const setFiles = (next: File[] | ((prev: File[]) => File[])) => {
    const value = typeof next === "function" ? next(files) : next;
    if (onFilesChange) onFilesChange(value);
    else setOwn(value);
  };
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = incoming.filter((f) => f.size > MAX_BYTES);
    setError(tooBig.length ? `${tooBig.map((f) => f.name).join(", ")} exceeds the 10 MB limit.` : null);
    setFiles((prev) => [...prev, ...incoming.filter((f) => f.size <= MAX_BYTES)]);
  };

  return (
    <div className="upload">
      <div
        className={dragging ? "dropzone is-dragging" : "dropzone"}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
      >
        <Icon name="upload" size={24} />
        <p className="dropzone-title">{title}</p>
        <p className="dropzone-hint">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="upload-error">{error}</p>}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={f.name + i} className="file-item">
              <Icon name="file" size={18} />
              <span className="file-name">{f.name}</span>
              <span className="file-size">{size(f.size)}</span>
              <button
                type="button"
                className="icon-action"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
