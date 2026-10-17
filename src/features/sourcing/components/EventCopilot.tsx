"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/layout/icons";

type Message = { role: "user" | "assistant"; text: string };

const suggestions = [
  "Why is this event stuck in approval?",
  "Which requirements does the lowest bid miss?",
  "Summarise where this event stands.",
];

export function EventCopilot({ eventId, title }: { eventId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = (q: string) => {
    const question = q.trim();
    if (!question && files.length === 0) return;
    const attached = files.length ? `${question ? "\n" : ""}📎 ${files.map((f) => f.name).join(", ")}` : "";
    setFiles([]);
    setMessages((m) => [
      ...m,
      { role: "user", text: question + attached },
      // Prototype reply — replace with the real copilot response.
      { role: "assistant", text: "The copilot is not connected yet. Answers will cite evidence and rules from this event." },
    ]);
    setText("");
  };

  if (!open) {
    return (
      <button type="button" className="cp-fab" onClick={() => setOpen(true)}>
        <Icon name="sparkles" size={20} />
        Ask about this event
      </button>
    );
  }

  return (
    <aside className={wide ? "cp-panel is-wide" : "cp-panel"} role="dialog" aria-label="Event Copilot">
      <header className="cp-head">
        <span className="cp-logo">
          <Icon name="sparkles" size={20} />
        </span>
        <h2 className="cp-title">Event Copilot</h2>
        <button
          type="button"
          className="cp-icon-btn"
          aria-label={wide ? "Shrink panel" : "Expand panel"}
          onClick={() => setWide((w) => !w)}
        >
          <Icon name={wide ? "shrink" : "expand"} size={18} />
        </button>
        <button type="button" className="cp-icon-btn" aria-label="Close" onClick={() => setOpen(false)}>
          <Icon name="close" size={18} />
        </button>
      </header>

      {messages.length === 0 ? (
        <div className="cp-hero">
          <span className="cp-orb">
            <Icon name="sparkles" size={44} />
          </span>
          <h3 className="cp-hero-title">Ask about this event</h3>
          <p className="cp-hero-sub">
            {eventId} · {title}
          </p>
        </div>
      ) : (
        <div className="cp-thread">
          {messages.map((m, i) => (
            <p key={i} className={`cp-msg is-${m.role}`}>
              {m.text}
            </p>
          ))}
          <div ref={endRef} />
        </div>
      )}

      {messages.length === 0 && (
        <div className="cp-suggestions">
          {suggestions.map((s) => (
            <button key={s} type="button" className="cp-chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="cp-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <span className="cp-sharing">
          <Icon name="lock" size={14} />
          Sharing {eventId} · {title}
        </span>
        {files.length > 0 && (
          <ul className="cp-files">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="cp-file">
                <Icon name="file" size={14} />
                <span>{f.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))}
                >
                  <Icon name="close" size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <textarea
          ref={inputRef}
          className="cp-input"
          rows={1}
          placeholder="Ask a question about this event"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
        />
        <div className="cp-actions">
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              if (picked.length) setFiles((fs) => [...fs, ...picked]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="cp-plus"
            aria-label="Attach a file"
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="plus" size={18} />
          </button>
          <button type="submit" className="cp-send" aria-label="Send" disabled={!text.trim() && files.length === 0}>
            <Icon name="send" size={18} />
          </button>
        </div>
      </form>

      <p className="cp-foot">Answers cite evidence and rules. The approver decides.</p>
    </aside>
  );
}
