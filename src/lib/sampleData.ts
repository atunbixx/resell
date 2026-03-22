export type InventoryItem = {
  id: string;
  title: string;
  status: "Unlisted" | "Listed" | "Sold";
  condition: "New" | "Like new" | "Good" | "Fair";
  costPence: number;
  platform: "eBay" | "Vinted" | "Depop";
  notes: string;
  addedAt: string;
};

export type ExpenseItem = {
  id: string;
  description: string;
  amountPence: number;
  category: "Packaging" | "Storage" | "Shipping" | "Other";
  transactionDate: string;
};

export type SaleItem = {
  id: string;
  itemId: string;
  title: string;
  salePricePence: number;
  saleDate: string;
  platform: "eBay" | "Vinted" | "Depop";
  platformFeePercent: number;
  platformFeePence: number;
  postageCostPence: number;
  profitPence: number;
  notes: string;
};

export const sampleInventory: InventoryItem[] = [
  {
    id: "item-1",
    title: "Nike windbreaker",
    status: "Listed",
    condition: "Good",
    costPence: 1200,
    platform: "Vinted",
    notes: "Bright colour, good zip",
    addedAt: "2026-03-08",
  },
  {
    id: "item-2",
    title: "Sony Walkman WM-FX",
    status: "Sold",
    condition: "Good",
    costPence: 950,
    platform: "eBay",
    notes: "Battery cover intact",
    addedAt: "2026-03-04",
  },
  {
    id: "item-3",
    title: "Levi's 501 jeans",
    status: "Unlisted",
    condition: "Like new",
    costPence: 700,
    platform: "Depop",
    notes: "Good wash, no major wear",
    addedAt: "2026-03-11",
  },
];

export const sampleExpenses: ExpenseItem[] = [
  {
    id: "exp-1",
    description: "Packaging supplies",
    amountPence: 850,
    category: "Packaging",
    transactionDate: "2026-03-06",
  },
  {
    id: "exp-2",
    description: "Shelf storage box",
    amountPence: 1400,
    category: "Storage",
    transactionDate: "2026-03-07",
  },
  {
    id: "exp-3",
    description: "Shipping labels",
    amountPence: 1120,
    category: "Shipping",
    transactionDate: "2026-03-10",
  },
];

export const sampleSales: SaleItem[] = [
  {
    id: "sale-1",
    itemId: "item-2",
    title: "Sony Walkman WM-FX",
    salePricePence: 5200,
    saleDate: "2026-03-15",
    platform: "eBay",
    platformFeePercent: 12.8,
    platformFeePence: 666,
    postageCostPence: 320,
    profitPence: 3264,
    notes: "Working unit, tested before dispatch",
  },
];

export function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export function parsePoundsToPence(value: string) {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
