"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/layout/icons";
import { answerQuestion, attachNote, type Answer, type Chart, type Citation } from "@/features/dashboard/ask";
import { takeFromDashboard } from "../handoff";
import { ReasoningDrawer } from "./ReasoningDrawer";

type Attached = { name: string; size: number };
type Turn = { id: string; q: string; files: Attached[]; a: Answer; ready: boolean };

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg";
const bytes = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
type Conv = { id: string; title: string; turns: Turn[] };
/** Only the questions are saved. Answers are rebuilt from the data, so they never go stale. */
type Saved = { id: string; title: string; qs: string[] };

const KEY = "procure.copilot.v1";
const RAIL_KEY = "procure.copilot.rail";
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const titleOf = (q: string) => (q.length > 38 ? `${q.slice(0, 36)}…` : q);

const starters: { label: string; q: string; icon: IconName }[] = [
  { label: "Needs attention", q: "What needs my attention first?", icon: "alert" },
  { label: "Pending approvals", q: "What is waiting for approval?", icon: "approvals" },
  { label: "Summarise SE-1047", q: "Summarise SE-1047", icon: "file" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function load(): Conv[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Saved[]).map((s) => ({
      id: s.id,
      title: s.title,
      turns: s.qs.map((q) => ({ id: uid(), q, files: [], a: answerQuestion(q), ready: true })),
    }));
  } catch {
    return [];
  }
}

function save(convs: Conv[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(convs.map((c): Saved => ({ id: c.id, title: c.title, qs: c.turns.map((t) => t.q) }))));
  } catch {
    // Storage blocked: history just lasts for this visit.
  }
}

export function CopilotChat() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState<Turn | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hello, setHello] = useState("Hello");
  const [railOpen, setRailOpen] = useState(true);
  const toggleRail = (next: boolean) => {
    setRailOpen(next);
    try {
      window.localStorage.setItem(RAIL_KEY, next ? "1" : "0");
    } catch {
      // Storage blocked: the choice lasts for this visit.
    }
  };
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Keep what is already there: in dev React runs this twice, and the second run must not wipe a chat started below.
    setConvs((prev) => (prev.length ? prev : load()));
    setHello(greeting());
    try {
      setRailOpen(window.localStorage.getItem(RAIL_KEY) !== "0");
    } catch {
      // Default to open.
    }
    setLoaded(true);
    // A question asked from the dashboard opens here as a new chat.
    const handed = takeFromDashboard();
    if (handed) send(handed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (loaded) save(convs);
  }, [convs, loaded]);

  const active = convs.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [active?.turns.length, active?.turns.at(-1)?.ready]);

  const send = useCallback(
    (raw: string) => {
      const q = raw.trim() || (files.length ? "Review the attached files" : "");
      if (!q) return;
      const attached = files.map((f) => ({ name: f.name, size: f.size }));
      const turn: Turn = { id: uid(), q, files: attached, a: attachNote(answerQuestion(q), attached.map((f) => f.name)), ready: false };
      const convId = activeId ?? uid();
      setConvs((prev) =>
        prev.some((c) => c.id === convId)
          ? prev.map((c) => (c.id === convId ? { ...c, turns: [...c.turns, turn] } : c))
          : [{ id: convId, title: titleOf(q), turns: [turn] }, ...prev],
      );
      setActiveId(convId);
      setText("");
      setFiles([]);
      if (input.current) input.current.style.height = "auto";
      // A short pause so the reply feels worked out, not instant.
      window.setTimeout(
        () => setConvs((prev) => prev.map((c) => (c.id === convId ? { ...c, turns: c.turns.map((t) => (t.id === turn.id ? { ...t, ready: true } : t)) } : c))),
        750,
      );
    },
    [activeId, files],
  );

  const remove = (id: string) => {
    setConvs((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };
  const newChat = () => {
    setActiveId(null);
    setText("");
    window.setTimeout(() => input.current?.focus(), 0);
  };

  const busy = !!active?.turns.some((t) => !t.ready);
  const composer = (
    <Composer
      value={text}
      onChange={setText}
      files={files}
      onFiles={setFiles}
      onSend={() => !busy && send(text)}
      busy={busy}
      large={!active}
      inputRef={input}
    />
  );

  return (
    <div className={railOpen ? "cpl" : "cpl is-rail-closed"}>
      <section className={active ? "cpl-main" : "cpl-main is-empty"} aria-label="Copilot">
        {!active ? (
          <div className="cpl-scroll">
            <div className="cpl-hero">
              <span className="cpl-logo">
                <Icon name="sparkles" size={26} />
              </span>
              <h1>{hello}, Admin</h1>
              <p className="cpl-hero-sub">What are we working on today?</p>

              {composer}

              <div className="cpl-starters">
                {starters.map((s) => (
                  <button key={s.label} type="button" onClick={() => send(s.q)}>
                    <Icon name={s.icon} size={16} />
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="cpl-hero-note">Every answer shows the records it came from and how it was worked out.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="cpl-scroll" ref={scroller}>
              <ol className="cpl-thread">
                {active.turns.map((t) => (
                  <li key={t.id}>
                    <div className="cpl-q">
                      {t.files.length > 0 && (
                        <ul className="cpl-q-files">
                          {t.files.map((f) => (
                            <li key={f.name}>
                              <Icon name="file" size={14} />
                              {f.name}
                            </li>
                          ))}
                        </ul>
                      )}
                      {t.q}
                    </div>
                    <AnswerBlock turn={t} onReason={() => setOpen(t)} />
                  </li>
                ))}
              </ol>
            </div>
            <div className="cpl-dock">
              {composer}
              <p className="cpl-note">Answers use your sourcing, vendor and approval data. Open the sources to check them.</p>
            </div>
          </>
        )}
      </section>

      <aside className="cpl-rail" aria-label="Chat history">
        <div className="cpl-rail-top">
          {railOpen ? (
            <>
              <button type="button" className="cpl-new" onClick={newChat}>
                <Icon name="plus" size={16} />
                New chat
              </button>
              <button type="button" className="cpl-rail-toggle" aria-label="Collapse chat history" aria-expanded onClick={() => toggleRail(false)}>
                <Icon name="right" size={18} />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="cpl-rail-toggle" aria-label="Expand chat history" aria-expanded={false} onClick={() => toggleRail(true)}>
                <Icon name="back" size={18} />
              </button>
              <button type="button" className="cpl-rail-toggle cpl-rail-new" aria-label="New chat" title="New chat" onClick={newChat}>
                <Icon name="plus" size={18} />
              </button>
            </>
          )}
        </div>
        {railOpen && (
          <>
            {convs.length > 0 ? <p className="cpl-rail-label">Recent</p> : <p className="cpl-rail-empty">Your chats will show here.</p>}
            <ul className="cpl-hist">
              {convs.map((c) => (
                <li key={c.id} className={c.id === activeId ? "is-on" : undefined}>
                  <button type="button" className="cpl-hist-btn" onClick={() => setActiveId(c.id)}>
                    {c.title}
                  </button>
                  <button type="button" className="cpl-hist-del" aria-label={`Delete ${c.title}`} onClick={() => remove(c.id)}>
                    <Icon name="trash" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      {open && <ReasoningDrawer question={open.q} answer={open.a} onClose={() => setOpen(null)} />}
    </div>
  );
}

type SpeechCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function Composer({
  value,
  onChange,
  files,
  onFiles,
  onSend,
  busy,
  large,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  files: File[];
  onFiles: (f: File[]) => void;
  onSend: () => void;
  busy: boolean;
  large: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [listening, setListening] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [problem, setProblem] = useState("");
  const picker = useRef<HTMLInputElement>(null);
  const rec = useRef<InstanceType<SpeechCtor> | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    setCanListen(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
    return () => rec.current?.stop();
  }, []);

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    const issues: string[] = [];
    for (const f of Array.from(incoming)) {
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      if (f.size > MAX_BYTES) issues.push(`${f.name} is over 10 MB`);
      else if (next.length >= MAX_FILES) issues.push(`only ${MAX_FILES} files at a time`);
      else next.push(f);
    }
    onFiles(next);
    setProblem(issues.length ? `Not added: ${Array.from(new Set(issues)).join(", ")}.` : "");
  };

  const dictate = () => {
    if (listening) return rec.current?.stop();
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = (e) => {
      const said = Array.from(e.results, (x) => x[0].transcript).join(" ").trim();
      if (said) onChange(`${value}${value && !value.endsWith(" ") ? " " : ""}${said}`);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  };

  const cls = ["cpl-composer", large ? "is-large" : "", dragging ? "is-drop" : ""].filter(Boolean).join(" ");

  return (
    <form
      className={cls}
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDragging(false)}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
      }}
    >
      {files.length > 0 && (
        <ul className="cpl-files">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`}>
              <Icon name="file" size={16} />
              <span className="cpl-file-name" title={f.name}>
                {f.name}
              </span>
              <small>{bytes(f.size)}</small>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => onFiles(files.filter((_, j) => j !== i))}>
                <Icon name="close" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <textarea
        ref={inputRef}
        rows={large ? 2 : 1}
        value={value}
        autoFocus={large}
        placeholder={dragging ? "Drop files to attach" : "Ask about an event, a bid, a vendor or an approval"}
        aria-label="Message Copilot"
        onChange={(e) => {
          onChange(e.target.value);
          grow(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />

      {problem && (
        <p className="cpl-attach-problem" role="alert">
          {problem}
        </p>
      )}

      <div className="cpl-tools">
        <input
          ref={picker}
          type="file"
          multiple
          hidden
          accept={ACCEPT}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button type="button" className="cpl-tool" aria-label="Attach files" title="Attach files" onClick={() => picker.current?.click()}>
          <Icon name="plus" size={18} />
        </button>
        <span className="cpl-scope" title="Answers use your sourcing, vendor and approval records">
          <Icon name="shield" size={14} />
          Your records
        </span>

        <span className="cpl-tools-gap" />

        {canListen && (
          <button
            type="button"
            className={listening ? "cpl-tool is-live" : "cpl-tool"}
            aria-label={listening ? "Stop dictation" : "Dictate"}
            aria-pressed={listening}
            onClick={dictate}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        )}
        <button type="submit" className="cpl-send" aria-label="Send" disabled={(!value.trim() && files.length === 0) || busy}>
          <Icon name="send" size={18} />
        </button>
      </div>
    </form>
  );
}

function ChartBlock({ chart, citations }: { chart: Chart; citations: Citation[] }) {
  const max = Math.max(1, ...chart.bars.map((b) => b.value));
  const href = (id?: string) => citations.find((c) => c.id === id)?.href;
  return (
    <figure className="cpl-chart">
      <figcaption>{chart.title}</figcaption>
      <ul>
        {chart.bars.map((b) => {
          const to = href(b.cite);
          return (
            <li key={b.label} className={b.focus ? "is-focus" : undefined}>
              {to ? (
                <Link href={to} className="cpl-chart-label" title={b.label}>
                  {b.label}
                </Link>
              ) : (
                <span className="cpl-chart-label" title={b.label}>
                  {b.label}
                </span>
              )}
              <span className="cpl-chart-track" aria-hidden="true">
                <i style={{ width: `${Math.max(2, (b.value / max) * 100)}%` }} />
              </span>
              <span className="cpl-chart-val">{b.display}</span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

function AnswerBlock({ turn, onReason }: { turn: Turn; onReason: () => void }) {
  const { a } = turn;
  const num = (id?: string) => (id ? a.citations.findIndex((c) => c.id === id) + 1 : 0);

  return (
    <div className="cpl-a">
      <span className="cpl-avatar" aria-hidden="true">
        <Icon name="sparkles" size={14} />
      </span>
      <div className="cpl-a-body">
        {!turn.ready ? (
          <p className="cpl-thinking" role="status">
            Looking through your records<i />
            <i />
            <i />
          </p>
        ) : (
          <div className="cpl-a-in">
            <p className="cpl-a-text">{a.text}</p>

            {a.items.length > 0 && (
              <ul className="cpl-a-list">
                {a.items.map((it) => {
                  const n = num(it.cite);
                  const c = n ? a.citations[n - 1] : undefined;
                  return (
                    <li key={it.text}>
                      {it.text}
                      {c && (
                        <Link href={c.href} className="cpl-cite" title={`${c.id} · ${c.label}`} aria-label={`Source ${n}: ${c.label}`}>
                          {n}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {a.chart && <ChartBlock chart={a.chart} citations={a.citations} />}

            {a.citations.length > 0 && (
              <div className="cpl-sources">
                <span>Sources</span>
                {a.citations.map((c, i) => (
                  <Link key={c.id} href={c.href} className="cpl-chip" title={`${c.label} · ${c.detail}`}>
                    <b>{i + 1}</b>
                    {c.id}
                  </Link>
                ))}
              </div>
            )}

            <button type="button" className="cpl-reason" onClick={onReason}>
              <Icon name="sparkles" size={14} />
              How I got this · {a.steps.length} steps
              <Icon name="right" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
