"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/layout/icons";
import { COPILOT_PATH, stashForCopilot } from "@/features/copilot/handoff";
import { suggestions } from "../ask";
import { ATTENTION_BASELINE, attentionItems, attentionUpdatedAt } from "../queries";
import { AttentionZone } from "./AttentionZone";
import { KpiGrid } from "./KpiGrid";

const SEEN_KEY = "procure.attention.seenAt";
const heroSuggestions = suggestions.slice(0, 3);
const latestUpdate = attentionItems.reduce((m, p) => (attentionUpdatedAt[p.id] > m ? attentionUpdatedAt[p.id] : m), "");

const readSeen = () => {
  try {
    return window.localStorage.getItem(SEEN_KEY) ?? ATTENTION_BASELINE;
  } catch {
    return ATTENTION_BASELINE;
  }
};

type Section = { id: string; label: string; icon: IconName };
const sections: Section[] = [
  { id: "attention", label: "Immediate attention", icon: "alert" },
  { id: "kpi", label: "KPI", icon: "dashboard" },
];

const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export function DashboardHome() {
  const router = useRouter();
  // null until localStorage has been read, so a returning visitor never sees a flash of "new".
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [seenAtLoad, setSeenAtLoad] = useState<string | null>(null);

  useEffect(() => {
    const s = readSeen();
    setSeenAt(s);
    setSeenAtLoad(s);
  }, []);

  const newIds = useMemo(
    () => new Set(seenAtLoad ? attentionItems.filter((p) => attentionUpdatedAt[p.id] > seenAtLoad).map((p) => p.id) : []),
    [seenAtLoad],
  );
  const unseen = seenAt ? attentionItems.filter((p) => attentionUpdatedAt[p.id] > seenAt).length : 0;

  const markSeen = useCallback(() => {
    const now = new Date().toISOString();
    const stamp = now > latestUpdate ? now : latestUpdate;
    setSeenAt(stamp);
    try {
      window.localStorage.setItem(SEEN_KEY, stamp);
    } catch {
      // Storage blocked: the dot just clears for this visit.
    }
  }, []);

  // Reading the section counts as seeing it.
  useEffect(() => {
    const el = document.getElementById("attention");
    if (!el || unseen === 0) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(markSeen, 1500);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [unseen, markSeen]);

  // Questions are answered in the Copilot, as a new chat.
  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    stashForCopilot(question);
    router.push(COPILOT_PATH);
  };

  const jump = (id: string) => {
    goTo(id);
    if (id === "attention") window.setTimeout(markSeen, 900);
  };

  return (
    <div className="dash-home">
      <section className="dash-hero" aria-label="Ask Procure AI">
        <div className="aurora" aria-hidden="true">
          <i className="aurora-blob is-a" />
          <i className="aurora-blob is-b" />
          <i className="aurora-blob is-c" />
        </div>

        <div className="dash-hero-inner">
          <h1 className="dash-greeting">
            What&apos;s on your mind
            <br />
            today, Admin?
          </h1>

          <div className="dash-suggest" role="list">
            {heroSuggestions.map((s) => (
              <button key={s} type="button" role="listitem" className="dash-suggest-chip" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>

          <Composer onSend={ask} placeholder="Ask about an event, a bid, a vendor or an approval" id="hero" />
          <p className="dash-disclaimer">Answers come from your sourcing, vendor and approval data. Check anything critical before acting.</p>

        </div>

        <nav className="dash-jump" aria-label="Jump to a section">
          {sections.map((s) => (
            <button key={s.id} type="button" className="dash-jump-chip" onClick={() => jump(s.id)}>
              <Icon name={s.icon} size={16} />
              {s.label}
              {s.id === "attention" && unseen > 0 && (
                <span className="dash-jump-badge" aria-label={`${unseen} updated since your last visit`}>
                  <i />
                  {unseen}
                </span>
              )}
            </button>
          ))}
        </nav>
      </section>

      <AttentionZone newIds={newIds} />

      <section id="kpi" className="dash-section">
        <KpiGrid />
      </section>
    </div>
  );
}

function Composer({ onSend, placeholder, id, compact }: { onSend: (q: string) => void; placeholder: string; id: string; compact?: boolean }) {
  const [text, setText] = useState("");
  return (
    <form
      className={compact ? "dash-composer is-compact" : "dash-composer"}
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
      }}
    >
      <input id={`ask-${id}`} className="dash-composer-input" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Ask a question" />
      <button type="submit" className="dash-ask-send" aria-label="Send" disabled={!text.trim()}>
        <Icon name="send" size={18} />
      </button>
    </form>
  );
}
