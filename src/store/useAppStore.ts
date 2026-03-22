import { create } from "zustand";
import {
  createId,
  sampleExpenses,
  sampleInventory,
  sampleSales,
  type ExpenseItem,
  type InventoryItem,
  type SaleItem,
} from "../lib/sampleData";
import { loadPersistedAppState, savePersistedAppState } from "../lib/storage";

type AddInventoryInput = {
  title: string;
  costPence: number;
  addedAt: string;
  platform: InventoryItem["platform"];
  condition: InventoryItem["condition"];
  notes: string;
};

type AddExpenseInput = {
  description: string;
  amountPence: number;
  category: ExpenseItem["category"];
  transactionDate: string;
};

type AppState = {
  inventory: InventoryItem[];
  expenses: ExpenseItem[];
  sales: SaleItem[];
  hasHydrated: boolean;
  hydrate: () => void;
  addInventoryItem: (input: AddInventoryInput) => void;
  addExpense: (input: AddExpenseInput) => void;
  addSale: (input: {
    itemId: string;
    salePricePence: number;
    saleDate: string;
    platform: SaleItem["platform"];
    postageCostPence: number;
    notes: string;
  }) => void;
};

const defaultState = {
  inventory: sampleInventory,
  expenses: sampleExpenses,
  sales: sampleSales,
};

function persistState(
  inventory: InventoryItem[],
  expenses: ExpenseItem[],
  sales: SaleItem[],
) {
  savePersistedAppState({ inventory, expenses, sales });
}

export const useAppStore = create<AppState>((set, get) => ({
  ...defaultState,
  hasHydrated: false,
  hydrate: () => {
    if (get().hasHydrated) {
      return;
    }

    const persisted = loadPersistedAppState();
    if (!persisted) {
      persistState(defaultState.inventory, defaultState.expenses, defaultState.sales);
      set({ hasHydrated: true });
      return;
    }

    set({
      inventory: persisted.inventory,
      expenses: persisted.expenses,
      sales: persisted.sales ?? [],
      hasHydrated: true,
    });
  },
  addInventoryItem: (input) => {
    const nextItem: InventoryItem = {
      id: createId("item"),
      title: input.title,
      status: "Unlisted",
      condition: input.condition,
      costPence: input.costPence,
      platform: input.platform,
      notes: input.notes,
      addedAt: input.addedAt,
    };

    const inventory = [nextItem, ...get().inventory];
    const expenses = get().expenses;
    const sales = get().sales;
    persistState(inventory, expenses, sales);
    set({ inventory });
  },
  addExpense: (input) => {
    const nextExpense: ExpenseItem = {
      id: createId("expense"),
      description: input.description,
      amountPence: input.amountPence,
      category: input.category,
      transactionDate: input.transactionDate,
    };

    const inventory = get().inventory;
    const expenses = [nextExpense, ...get().expenses];
    const sales = get().sales;
    persistState(inventory, expenses, sales);
    set({ expenses });
  },
  addSale: (input) => {
    const item = get().inventory.find((entry) => entry.id === input.itemId);
    if (!item) {
      return;
    }

    const feePercentByPlatform: Record<SaleItem["platform"], number> = {
      eBay: 12.8,
      Vinted: 5,
      Depop: 10,
    };

    const platformFeePercent = feePercentByPlatform[input.platform];
    const platformFeePence = Math.round(
      input.salePricePence * (platformFeePercent / 100),
    );
    const profitPence =
      input.salePricePence -
      platformFeePence -
      input.postageCostPence -
      item.costPence;

    const sale: SaleItem = {
      id: createId("sale"),
      itemId: item.id,
      title: item.title,
      salePricePence: input.salePricePence,
      saleDate: input.saleDate,
      platform: input.platform,
      platformFeePercent,
      platformFeePence,
      postageCostPence: input.postageCostPence,
      profitPence,
      notes: input.notes,
    };

    const inventory = get().inventory.map((entry) =>
      entry.id === item.id
        ? {
            ...entry,
            status: "Sold" as const,
          }
        : entry,
    );
    const expenses = get().expenses;
    const sales = [sale, ...get().sales];
    persistState(inventory, expenses, sales);
    set({ inventory, sales });
  },
}));
