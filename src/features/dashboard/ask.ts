import { events, priorities, type SourcingEvent } from "@/features/sourcing/data";
import { vendorList, type Vendor } from "@/features/vendors/data";
import { ageInDays, attentionItems, formatMoney, parseValue, pendingApprovals } from "./queries";

/** A record an answer is based on. Opens the event or vendor it came from. */
export type Citation = { id: string; kind: "Event" | "Vendor"; label: string; detail: string; href: string };
/** One line of the reasoning behind an answer. `cites` are citation ids that back this step. */
export type Step = { title: string; detail: string; cites?: string[] };
export type AnswerItem = { text: string; /** Citation id this line comes from. */ cite?: string };
/** A small bar chart shown with an answer. A bar with `cite` links to that record. */
export type Chart = { title: string; bars: { label: string; value: number; display: string; cite?: string; focus?: boolean }[] };
export type Answer = { text: string; items: AnswerItem[]; citations: Citation[]; steps: Step[]; chart?: Chart };

/** Adds a chart and the step that explains it, just before the conclusion. */
function withChart(a: Answer, chart: Chart): Answer {
  const step: Step = { title: "Charted the figures", detail: `${chart.title}. Every bar is taken from the records listed under Sources.` };
  const steps = [...a.steps];
  steps.splice(Math.max(0, steps.length - 1), 0, step);
  return { ...a, steps, chart };
}

type Rule = { question: string; match: string[]; answer: () => Answer };

const eventCite = (e: SourcingEvent): Citation => ({
  id: e.id,
  kind: "Event",
  label: e.title,
  detail: `${e.status} · ${e.value} · updated ${e.updatedAt}`,
  href: `/admin/sourcing-events/${e.id}`,
});
const vendorCite = (v: Vendor): Citation => ({
  id: v.id,
  kind: "Vendor",
  label: v.name,
  detail: `${v.status} · score ${v.score} · ${v.country}`,
  href: `/admin/vendors/${v.id}`,
});
const eventById = (id: string) => events.find((e) => e.id === id);
const uniq = (list: (Citation | undefined)[]): Citation[] => {
  const seen = new Set<string>();
  return list.filter((c): c is Citation => !!c && !seen.has(c.id) && !!seen.add(c.id));
};
const eventCites = (ids: string[]) => uniq(ids.map((id) => (eventById(id) ? eventCite(eventById(id)!) : undefined)));

// Prototype answers computed from the mock data — replace with the real assistant. Each answer says
// what it read, how it worked, and which records back it, so the reasoning panel has something true to show.
const rules: Rule[] = [
  {
    question: "What needs my attention first?",
    match: ["attention", "urgent", "first", "priority"],
    answer: () => {
      const urgent = attentionItems.filter((p) => p.level === "Urgent");
      const lead = attentionItems[0];
      return {
        text: `${priorities.length} items need attention. Start with the urgent one.`,
        items: attentionItems.map((p) => ({ text: `${p.level}: ${p.title}. ${p.reason}`, cite: p.eventId })),
        citations: eventCites(attentionItems.map((p) => p.eventId)),
        steps: [
          { title: "Read the attention list", detail: `${priorities.length} sourcing events are flagged, each with a reason and a level.`, cites: attentionItems.map((p) => p.eventId) },
          { title: "Ranked them by level", detail: `${urgent.length} urgent, then high, then medium. Items at the same level keep the order they were flagged in.` },
          { title: "Checked the top item against its event", detail: `${lead.eventId}: ${lead.reason}`, cites: [lead.eventId] },
          { title: "Conclusion", detail: `${lead.title} comes first because it is the only ${lead.level.toLowerCase()} item and it has a date attached.`, cites: [lead.eventId] },
        ],
      };
    },
  },
  {
    question: "What is waiting for approval?",
    match: ["approval", "approve", "sign-off", "stuck"],
    answer: () => {
      const oldest = [...pendingApprovals].sort((a, b) => ageInDays(b.submittedAt) - ageInDays(a.submittedAt))[0];
      const ids = Array.from(new Set(pendingApprovals.map((q) => q.eventId)));
      return {
        text: `${pendingApprovals.length} approvals are pending.`,
        items: pendingApprovals.map((q) => ({
          text: `${q.what} for ${q.eventTitle} (${q.value}) is with ${q.approver}, waiting ${ageInDays(q.submittedAt)} days.`,
          cite: q.eventId,
        })),
        citations: eventCites(ids),
        steps: [
          { title: "Opened the approval queue", detail: `Looked at every request and kept the ones with status Pending: ${pendingApprovals.length}.` },
          { title: "Matched each request to its event", detail: `They belong to ${ids.length} events. Each event page holds the full approval trail.`, cites: ids },
          { title: "Worked out how long each has waited", detail: `Counted days from submission to today. The longest wait is ${ageInDays(oldest.submittedAt)} days, ${oldest.what} for ${oldest.eventTitle}.`, cites: [oldest.eventId] },
          { title: "Conclusion", detail: `Report all ${pendingApprovals.length}, naming who each one is waiting on.` },
        ],
      };
    },
  },
  {
    question: "Which events are in evaluation?",
    match: ["evaluation", "evaluate", "scoring", "scored"],
    answer: () => {
      const list = events.filter((e) => e.status === "Evaluation");
      const total = list.reduce((s, e) => s + parseValue(e.value), 0);
      return {
        text: `${list.length} events are in evaluation.`,
        items: list.map((e) => ({ text: `${e.id} ${e.title}, ${e.value}, led by ${e.creator}.`, cite: e.id })),
        citations: list.map(eventCite),
        steps: [
          { title: "Filtered events by stage", detail: `Kept events whose status is Evaluation, out of ${events.length} in total.` },
          { title: "Read each event", detail: "Took the title, value and the person leading it.", cites: list.map((e) => e.id) },
          { title: "Added up the value", detail: `Together they are worth ${formatMoney(total)}.` },
          { title: "Conclusion", detail: `${list.length} events are being scored right now.` },
        ],
      };
    },
  },
  {
    question: "Which vendors are under review or blocked?",
    match: ["vendor", "supplier", "blocked", "review"],
    answer: () => {
      const list = vendorList.filter((v) => v.status !== "Approved");
      const low = list.filter((v) => v.score < 70);
      return {
        text: `${list.length} vendors are not approved.`,
        items: list.map((v) => ({ text: `${v.name} is ${v.status.toLowerCase()} (score ${v.score}, ${v.country}).`, cite: v.id })),
        citations: list.map(vendorCite),
        steps: [
          { title: "Scanned the vendor list", detail: `Checked the status of all ${vendorList.length} vendors.` },
          { title: "Kept the ones that are not Approved", detail: `${list.length} are either under review or blocked.`, cites: list.map((v) => v.id) },
          { title: "Compared their scores", detail: `${low.length} of them score below 70, the preferred threshold. Scores come from past events.`, cites: low.map((v) => v.id) },
          { title: "Conclusion", detail: "Name each vendor with its status, score and country." },
        ],
      };
    },
  },
  {
    question: "How much value is in the pipeline?",
    match: ["value", "pipeline", "spend", "worth", "total"],
    answer: () => {
      const open = events.filter((e) => e.status !== "Awarded");
      const total = open.reduce((s, e) => s + parseValue(e.value), 0);
      return {
        text: `${formatMoney(total)} is open across ${open.length} events.`,
        items: open.map((e) => ({ text: `${e.id} ${e.title}: ${e.value} (${e.status}).`, cite: e.id })),
        citations: open.map(eventCite),
        steps: [
          { title: "Decided what counts as pipeline", detail: "Any event that has not been awarded yet: draft, pending approval or in evaluation." },
          { title: "Collected those events", detail: `${open.length} of ${events.length} events qualify.`, cites: open.map((e) => e.id) },
          { title: "Read each estimated value", detail: "Converted values like $2.2M and $740K to plain numbers before adding them." },
          { title: "Conclusion", detail: `They add up to ${formatMoney(total)}.` },
        ],
      };
    },
  },
];

export const suggestions = rules.map((r) => r.question);
export const copilotSuggestions = [...suggestions, "Summarise SE-1047"];

/** "Tell me about SE-1047": an event looked up by its number. */
function aboutEvent(e: SourcingEvent): Answer {
  const approvals = pendingApprovals.filter((q) => q.eventId === e.id);
  const flags = priorities.filter((p) => p.eventId === e.id);
  const cite = eventCite(e);
  return {
    text: `${e.id} ${e.title} is ${e.status.toLowerCase()}, worth ${e.value}.`,
    items: [
      { text: `Project: ${e.project}. Led by ${e.creator}.`, cite: e.id },
      { text: `Last updated ${e.updatedAt}.`, cite: e.id },
      { text: approvals.length ? `${approvals.length} pending approval${approvals.length > 1 ? "s" : ""}: ${approvals.map((q) => `${q.what} with ${q.approver}`).join("; ")}.` : "No approvals are pending.", cite: e.id },
      ...flags.map((p) => ({ text: `${p.level} flag: ${p.title}. ${p.reason}`, cite: e.id })),
    ],
    citations: [cite],
    steps: [
      { title: "Matched the event number", detail: `${e.id} is ${e.title}.`, cites: [e.id] },
      { title: "Read its record", detail: `Status ${e.status}, value ${e.value}, owner ${e.creator}, project ${e.project}.`, cites: [e.id] },
      { title: "Checked the approval queue", detail: approvals.length ? `${approvals.length} request${approvals.length > 1 ? "s are" : " is"} still pending for this event.` : "Nothing is pending for this event." },
      { title: "Checked the attention list", detail: flags.length ? `${flags.length} flagged issue${flags.length > 1 ? "s" : ""} found.` : "It is not flagged for attention." },
    ],
  };
}

const eventBar = (e: SourcingEvent) => ({ label: `${e.id} ${e.title}`, value: parseValue(e.value), display: e.value, cite: e.id });
const byValue = (a: SourcingEvent, b: SourcingEvent) => parseValue(b.value) - parseValue(a.value);

const charts: Record<string, () => Chart> = {
  "What needs my attention first?": () => ({
    title: "Flagged items by level",
    bars: (["Urgent", "High", "Medium"] as const).map((l) => {
      const n = priorities.filter((p) => p.level === l).length;
      return { label: l, value: n, display: String(n) };
    }),
  }),
  "What is waiting for approval?": () => ({
    title: "Days each approval has waited",
    bars: [...pendingApprovals]
      .sort((a, b) => ageInDays(b.submittedAt) - ageInDays(a.submittedAt))
      .map((q) => ({ label: `${q.what} · ${q.eventId}`, value: ageInDays(q.submittedAt), display: `${ageInDays(q.submittedAt)} d`, cite: q.eventId })),
  }),
  "Which events are in evaluation?": () => ({
    title: "Value of events in evaluation",
    bars: events.filter((e) => e.status === "Evaluation").sort(byValue).map(eventBar),
  }),
  "Which vendors are under review or blocked?": () => ({
    title: "Performance score of vendors that are not approved",
    bars: vendorList.filter((v) => v.status !== "Approved").sort((a, b) => a.score - b.score).map((v) => ({ label: `${v.name} (${v.status.toLowerCase()})`, value: v.score, display: String(v.score), cite: v.id })),
  }),
  "How much value is in the pipeline?": () => ({
    title: "Value of each open event",
    bars: events.filter((e) => e.status !== "Awarded").sort(byValue).map(eventBar),
  }),
};

/**
 * Anything the rules don't cover. It still answers: an overview of the whole portfolio, charted, with the
 * biggest events cited. It says plainly that it didn't find a record for the exact question.
 */
function overview(q: string): Answer {
  const ranked = [...events].sort(byValue);
  const top = ranked.slice(0, 5);
  const open = events.filter((e) => e.status !== "Awarded");
  const total = open.reduce((s, e) => s + parseValue(e.value), 0);
  const topShare = Math.round((top.reduce((s, e) => s + parseValue(e.value), 0) / events.reduce((s, e) => s + parseValue(e.value), 0)) * 100);
  const lead = top[0];
  const quoted = q.length > 60 ? `${q.slice(0, 58)}…` : q;

  return {
    text: `I didn't find a record that answers "${quoted}" directly, so here is where the portfolio stands. ${formatMoney(total)} is open across ${open.length} events, and ${lead.title} is the largest at ${lead.value}.`,
    items: [
      { text: `The five largest events hold ${topShare}% of all value.`, cite: lead.id },
      { text: `${pendingApprovals.length} approvals are pending and ${priorities.length} items are flagged for attention.` },
      ...top.slice(0, 3).map((e) => ({ text: `${e.id} ${e.title}: ${e.value}, ${e.status.toLowerCase()}.`, cite: e.id })),
      { text: "Ask about an event by number, or about approvals, vendors, evaluation or the pipeline, for a precise answer." },
    ],
    citations: top.map(eventCite),
    steps: [
      { title: "Read your question", detail: `"${quoted}". No event number, vendor or approval term matched a specific record.` },
      { title: "Chose a portfolio overview", detail: "With nothing specific to look up, the most useful thing to report is the shape of the whole book of work." },
      { title: "Ranked every event by value", detail: `Read all ${events.length} events and sorted them by estimated value. The top five are cited.`, cites: top.map((e) => e.id) },
      { title: "Charted the largest events", detail: "Each bar is an event's estimated value, taken from its record.", cites: top.map((e) => e.id) },
      { title: "Conclusion", detail: `Reported the open total, the concentration in the top five (${topShare}%) and what is waiting on people. This is an overview, not an answer to the exact question.` },
    ],
    chart: { title: "Largest events by value", bars: top.map(eventBar) },
  };
}

/** Notes that files came with the question. Prototype: their contents aren't read, and the answer says so. */
export function attachNote(a: Answer, names: string[]): Answer {
  if (names.length === 0) return a;
  const many = names.length > 1;
  return {
    ...a,
    text: `${a.text} I haven't read ${many ? "the attached files" : "the attached file"} yet, so this comes from your records only.`,
    steps: [
      {
        title: many ? `Received ${names.length} attachments` : "Received your attachment",
        detail: `${names.join(", ")}. Reading uploaded files isn't connected yet, so ${many ? "their" : "its"} contents were not used.`,
      },
      ...a.steps,
    ],
  };
}

export function answerQuestion(q: string): Answer {
  const t = q.toLowerCase();
  const id = q.match(/SE-\d{4}/i)?.[0].toUpperCase();
  const found = id ? eventById(id) : undefined;
  if (found) {
    const open = events.filter((e) => e.status !== "Awarded").sort(byValue);
    const bars = (open.some((e) => e.id === found.id) ? open : [...open, found].sort(byValue)).map((e) => ({ ...eventBar(e), focus: e.id === found.id }));
    return withChart(aboutEvent(found), { title: `${found.id} against the other open events, by value`, bars });
  }

  const rule = rules.find((r) => r.question === q) ?? rules.find((r) => r.match.some((m) => t.includes(m)));
  if (!rule) return overview(q);
  return withChart(rule.answer(), charts[rule.question]());
}
