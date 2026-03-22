import type { ExpenseItem, InventoryItem, SaleItem } from "./sampleData";

const APP_STORAGE_KEY = "resell.app";
const BACKUP_VERSION = 1;

export type PersistedAppState = {
  inventory: InventoryItem[];
  expenses: ExpenseItem[];
  sales: SaleItem[];
};

export type BackupFile = PersistedAppState & {
  version: number;
  exportedAt: string;
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

export function createBackupFile(state: PersistedAppState): BackupFile {
  return {
    ...state,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
  };
}

export function parseBackupFile(raw: string): PersistedAppState {
  const parsed = JSON.parse(raw) as Partial<BackupFile>;

  if (
    parsed.version !== BACKUP_VERSION ||
    !Array.isArray(parsed.inventory) ||
    !Array.isArray(parsed.expenses) ||
    !Array.isArray(parsed.sales)
  ) {
    throw new Error("Invalid backup file.");
  }

  return {
    inventory: parsed.inventory,
    expenses: parsed.expenses,
    sales: parsed.sales,
  };
}
