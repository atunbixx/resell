import type { ExpenseItem, InventoryItem, SaleItem } from "./sampleData";

const APP_STORAGE_KEY = "resell.app";

export type PersistedAppState = {
  inventory: InventoryItem[];
  expenses: ExpenseItem[];
  sales: SaleItem[];
};

export function loadPersistedAppState(): PersistedAppState | null {
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return null;
  }
}

export function savePersistedAppState(state: PersistedAppState) {
  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
}
