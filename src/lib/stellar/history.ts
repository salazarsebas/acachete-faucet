export interface HistoryEntry {
  address: string;
  network: string;
  token: string;
  hash?: string;
  timestamp: number;
}

const STORAGE_KEY = "faucet-history";
const MAX_ENTRIES = 50;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    history.unshift(entry);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(0, MAX_ENTRIES)),
    );
    emitChange();
  } catch {
    // localStorage not available
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitChange();
  } catch {
    // localStorage not available
  }
}

export function getHistorySnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

export function getServerSnapshot(): string {
  return "[]";
}

export function subscribeToHistory(callback: () => void): () => void {
  listeners.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}
