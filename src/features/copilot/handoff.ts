// Hands a question from another page to the Copilot, which opens it as a new chat.
// sessionStorage lives for this tab only and the Copilot clears it as soon as it reads it.
const KEY = "procure.copilot.handoff";

export const COPILOT_PATH = "/admin/copilot";

export function stashForCopilot(question: string) {
  try {
    window.sessionStorage.setItem(KEY, question);
  } catch {
    // Storage blocked: the Copilot opens empty and the question is lost.
  }
}

export function takeFromDashboard(): string | null {
  try {
    const q = window.sessionStorage.getItem(KEY);
    if (q) window.sessionStorage.removeItem(KEY);
    return q;
  } catch {
    return null;
  }
}
