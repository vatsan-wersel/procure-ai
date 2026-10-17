// Prototype persistence — flows live in this browser's localStorage. Replace with API calls:
// save a new version per scope, and have the vendor portal fetch the latest for the vendor's category.
import { defaultFlow, type FlowStep } from "./stepTypes";

export const DEFAULT_SCOPE = "Default";

export type FlowVersion = { version: number; savedAt: string; savedBy: string; steps: FlowStep[] };
/** Version history per scope. A scope is "Default" or a vendor category that has its own flow. */
export type FlowStore = Record<string, FlowVersion[]>;

const KEY = "procure.kycFlows.v1";

export function loadStore(): FlowStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as FlowStore;
  } catch {
    // Storage unavailable or corrupt: fall back to the built-in flow.
  }
  return {};
}

export function saveStore(store: FlowStore): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export const latest = (store: FlowStore, scope: string): FlowVersion | undefined => store[scope]?.[store[scope].length - 1];

/** The flow to edit for a scope: its latest version, else the default flow's latest, else the built-in flow. */
export function stepsForScope(store: FlowStore, scope: string): FlowStep[] {
  return structuredClone(latest(store, scope)?.steps ?? latest(store, DEFAULT_SCOPE)?.steps ?? defaultFlow);
}

/** The flow a vendor of this category completes. */
export function activeFlow(store: FlowStore, category?: string): FlowStep[] {
  return (category && latest(store, category)?.steps) || latest(store, DEFAULT_SCOPE)?.steps || defaultFlow;
}

export function addVersion(store: FlowStore, scope: string, steps: FlowStep[], savedBy: string): FlowStore {
  const history = store[scope] ?? [];
  const version: FlowVersion = {
    version: (history[history.length - 1]?.version ?? 0) + 1,
    savedAt: new Date().toISOString(),
    savedBy,
    steps: structuredClone(steps),
  };
  return { ...store, [scope]: [...history, version] };
}

export function removeScope(store: FlowStore, scope: string): FlowStore {
  const { [scope]: _removed, ...rest } = store;
  return rest;
}
