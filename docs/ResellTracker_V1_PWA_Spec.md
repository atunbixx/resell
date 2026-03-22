**RESELLER TRACKER**

V1 PWA — Technical Specification

*One-Time Purchase · Mobile-First · Offline-Capable · £35–49*

| **Platform**<br>PWA (iOS + Android + Desktop) | **Database**<br>SQLite via OPFS | **Licensing**<br>Lemon Squeezy | **Price**<br>£35–49 one-time |
| --- | --- | --- | --- |

# **Executive Summary**

Reseller Tracker is a one-time-purchase Progressive Web App (£35–49) for UK resellers managing inventory and sales across eBay, Vinted, and Depop. All data lives locally on the user's device via SQLite — there are no accounts, no cloud subscription, and no ongoing server costs. A single one-time license activation via Lemon Squeezy protects against key-sharing.

This document covers the full V1 specification: screen-by-screen UX, database schema, activation flow, offline strategy, profit calculation logic, component architecture, and the upsell hooks that will convert free users to a future Pro subscription plan.

| *Design principle: beat the £5.50 Google Sheet by doing everything it does — plus photos, fee auto-calculation, monthly charts, and a mobile-first UX — while keeping zero ongoing cost to the buyer.* |
| --- |

# **Why This Beats the Spreadsheet**

| **The £5.50 Google Sheet** | Reseller Tracker PWA |
| --- | --- |
| **Manual data entry only — every sale typed by hand** | Quick-add from phone in <10 seconds with camera photo |
| **No photo storage** | Attach photos to items — taken directly from camera or uploaded |
| **Google Sheets mobile is clunky** | Mobile-first UI, installed to home screen like a real app |
| **No fee auto-calculation — user works it out themselves** | eBay 12.8% · Vinted 5% · Depop 10% auto-deducted from profit |
| **UK tax year only, static formula cells** | Dynamic tax summary; user-configurable dates and fees |
| **One-time £5.50, easy to share/copy** | £35–49, activation code tied to one device — copy-protected |
| **No export — data locked in Google Drive** | CSV export for accountants, works offline |

# **Tech Stack**

## **Why PWA over Native App**

A Progressive Web App (PWA) is a website that installs onto the user's phone like a real app — it gets its own home screen icon, works fully offline, and accesses the device camera. Crucially, it bypasses the App Store entirely, which means:

1. No Apple 30% cut on your £39 sale
2. No Google Play 15–30% cut
3. Activation codes via Lemon Squeezy work freely (Apple bans external payment systems in iOS apps)
4. No app store review delays — ship updates instantly
5. Works on iOS, Android, and Desktop from one codebase

## **Stack Overview**

| **Layer** | **Technology** | **Reason** |
| --- | --- | --- |
| Web Framework | Next.js 15 (App Router) | SSR + API routes + PWA support in one framework |
| Language | TypeScript | Type safety across DB schema, API, and UI |
| Styling | Tailwind CSS v4 | Fast, consistent, mobile-first utility classes |
| Local Database | SQLite via wa-sqlite (OPFS) | Full SQL on-device — fast, relational, zero server cost |
| State Management | Zustand + React Context | Lightweight global state for activation and UI |
| Charts | Recharts | Free, React-native, no external dependencies |
| Forms | React Hook Form + Zod | Fast validation, TypeScript-first schema definitions |
| Icons | Lucide React | Consistent, lightweight icon set |
| Service Worker | Workbox (via next-pwa) | Offline caching, background sync hooks for V2 |
| Payments + Licensing | Lemon Squeezy | Built-in license key generation + free validation API |
| Hosting | Vercel (free tier) | Zero-config Next.js deployment, global CDN |

## **Why NOT Electron / Tauri**

Desktop-only apps exclude mobile users. UK resellers buy at car boots, charity shops, and markets — they need to log items on their phone in the moment. A PWA gives them desktop AND mobile from one build.

## **Why NOT React Native**

React Native requires Apple/Google's payment systems for in-app unlocking, eliminating the activation code model. Building for both iOS and Android also adds 4–6 weeks vs a PWA. Start with PWA, build native in V2 once revenue justifies it.

# **Database Schema (SQLite)**

All data is stored in a single SQLite file inside the browser's Origin Private File System (OPFS) — a sandboxed, persistent storage area that survives app restarts and works offline. All monetary values are stored as integers (pence/cents) to avoid floating-point rounding errors.

## **Table: items**

| **Column** | **Type** | **Required** | **Notes** |
| --- | --- | --- | --- |
| id | TEXT (UUID) | Yes | Primary key, generated client-side |
| title | TEXT | Yes | Item name, 3–255 chars |
| description | TEXT | No | Optional listing description |
| purchase_price_pence | INTEGER | Yes | Stored in pence (e.g. £15.50 = 1550) |
| purchase_date | DATE | Yes | ISO date string |
| condition | TEXT | Yes | new / like-new / good / fair / poor |
| platform | TEXT | Yes | ebay / vinted / depop / other |
| storage_location | TEXT | No | Free-form (e.g. 'Shelf A', 'Box 3') |
| status | TEXT | Yes | listed / unlisted / undelivered / sold |
| photo_uri | TEXT | No | OPFS file path (items/{uuid}.webp) |
| notes | TEXT | No | Internal notes, max 500 chars |
| created_at | TIMESTAMP | Yes | Auto-set on insert |
| deleted_at | TIMESTAMP | No | Soft delete — null = active |

## **Table: sales**

| **Column** | **Type** | **Required** | **Notes** |
| --- | --- | --- | --- |
| id | TEXT (UUID) | Yes | Primary key |
| item_id | TEXT | Yes | FK → items.id (CASCADE delete) |
| sale_price_pence | INTEGER | Yes | Gross sale amount in pence |
| sale_date | DATE | Yes | Date of sale |
| platform | TEXT | Yes | Platform used for this sale |
| platform_fee_percent | DECIMAL | Yes | Snapshot of fee at time of sale |
| platform_fee_pence | INTEGER | Yes | Calculated: sale_price × fee% |
| postage_cost_pence | INTEGER | No | Optional — shipping cost deducted |
| profit_pence | INTEGER | Yes | Net profit (see formula below) |
| notes | TEXT | No | Optional sale notes |

## **Table: expenditures**

| **Column** | **Type** | **Required** | **Notes** |
| --- | --- | --- | --- |
| id | TEXT (UUID) | Yes | Primary key |
| category | TEXT | Yes | packaging / storage / subscription / shipping / other |
| description | TEXT | Yes | What was bought/paid |
| amount_pence | INTEGER | Yes | Amount in pence |
| transaction_date | DATE | Yes | When the cost was incurred |
| recurrence | TEXT | No | none / weekly / monthly / quarterly / annual |
| notes | TEXT | No | Optional |

## **Table: settings**

Single key-value store. Pre-populated on first launch with defaults.

| **Key** | **Default Value** | **Description** |
| --- | --- | --- |
| platform_fee_ebay | 12.8 | eBay fee % (user-editable in Settings) |
| platform_fee_vinted | 5.0 | Vinted fee % (user-editable) |
| platform_fee_depop | 10.0 | Depop fee % (user-editable) |
| currency | GBP | Display currency symbol |
| tax_year_start_month | 4 | UK: April (month 4) |
| tax_year_start_day | 6 | UK: 6th April |
| app_version | 1.0.0 | For future migration checks |

## **Table: app_state**

Single-row table (id always = 1) storing the activation token and app metadata.

| **Column** | **Type** | **Notes** |
| --- | --- | --- |
| id | INTEGER (1) | Enforced single row: CHECK (id = 1) |
| activation_token | TEXT | Returned by Lemon Squeezy on activation |
| activation_key_hash | TEXT | SHA-256 hash of the original key |
| activation_date | TIMESTAMP | When the key was first activated |
| license_valid_until | TIMESTAMP | NULL = lifetime licence (V1 default) |

# **Profit Calculation Logic**

## **Formula**

| *Net Profit = Sale Price − Platform Fee − Postage Cost − Purchase Price* |
| --- |

Broken down step by step:

1. Platform Fee (pence) = ROUND(sale_price_pence × (platform_fee_percent / 100))
2. Net Profit (pence) = sale_price_pence − platform_fee_pence − postage_cost_pence − purchase_price_pence
3. Display: divide pence value by 100 for £ display, formatted to 2 decimal places

## **Worked Example**

| **Component** | **Value** |
| --- | --- |
| Bought for | £8.00 (800p) |
| Sold on eBay for | £32.00 (3200p) |
| eBay fee (12.8%) | £4.10 (410p — rounded) |
| Postage cost | £3.20 (320p) |
| Net Profit | £16.70 (1670p) |
| ROI | 208.75% ((profit / purchase_price) × 100) |

## **Platform Fee Defaults**

Fees are pre-set in the settings table and editable by the user in the Settings screen. A snapshot of the fee is stored on each sale record so historical profit remains accurate if the user later updates the fee setting.

| **Platform** | **Default Fee** | **Notes** |
| --- | --- | --- |
| eBay | 12.8% | Final value fee (typical) |
| Vinted | 5.0% | Buyer protection fee |
| Depop | 10.0% | Standard seller fee |
| Other | 0.0% | User sets manually per sale |

# **Activation & Licensing**

## **Overview**

Lemon Squeezy handles payments and automatically generates a unique license key per purchase. The app makes one online check at first launch to validate and activate the key. After that, the app works fully offline forever — no re-checks, no phoning home.

## **Step-by-Step Flow**

1. Customer purchases on your Lemon Squeezy product page
2. Lemon Squeezy emails the customer a license key (format: RESELLER-XXXX-XXXX-XXXX)
3. Customer navigates to your PWA URL and taps 'Add to Home Screen'
4. App detects no activation token → redirects to /activate
5. Customer enters their license key
6. App validates format client-side (regex), then calls /api/validate-key (POST)
7. Server calls Lemon Squeezy Licenses API to verify key and mark as activated (max 1 activation)
8. On success: token stored in IndexedDB + SQLite app_state table, redirect to /dashboard
9. All future app launches: read token from IndexedDB — no network call needed

## **Edge Cases**

| **Scenario** | **Behaviour** |
| --- | --- |
| No internet on first launch | Show clear error: 'An internet connection is needed to activate. Please try again when online.' |
| Key already used (resold/shared) | Error: 'This key has already been activated. Contact support.' Lemon Squeezy enforces 1 activation max. |
| Invalid key format | Real-time inline validation — button stays disabled until format matches regex |
| 5+ failed attempts | 15-minute cooldown enforced via localStorage timestamp |
| User clears browser data | Token lost — user must re-activate. Show clear message on re-launch. |
| Lemon Squeezy API down | Graceful error: 'Cannot verify right now. Try again shortly.' |

## **Security Notes**

1. Token stored in IndexedDB — not localStorage (more secure, not accessible to injected scripts)
2. Token hash stored in SQLite app_state for audit trail — original key never stored
3. API call made server-side only — Lemon Squeezy secret key never exposed to the browser
4. Max activations = 1 enforced by Lemon Squeezy — sharing the key does not work

# **PWA Offline Strategy**

## **What Works Offline**

| **Feature** | **Offline** | **Online** |
| --- | --- | --- |
| View dashboard & charts | Yes (cached SQLite) | Yes |
| Browse inventory | Yes (SQLite) | Yes |
| Add new item (with photo) | Yes | Yes |
| Log a sale | Yes | Yes |
| Add expenditure | Yes | Yes |
| Export to CSV | Yes (local operation) | Yes |
| View monthly statistics | Yes | Yes |
| Tax year summary | Yes | Yes |
| Activate license key | No — requires network | Yes |
| Cloud backup / sync | No (not in V1) | No (not in V1) |

## **Caching Strategy**

Service worker uses Workbox with two strategies:

1. **Static assets (JS, CSS, icons): **Cache-first — served from cache, updated in background on network access
2. **API calls to /api/validate-key: **Network-only — never cache license validation responses
3. **SQLite database (OPFS): **Fully local — no caching needed, it lives on the device

| *Offline indicator: a persistent yellow banner ('You're offline — changes saved locally') appears at the bottom of the screen when the device loses connectivity, reassuring users their data is safe.* |
| --- |

# **Screen Specifications**

## **1. Activation Screen (/activate)**

Entry point for all new users and anyone who has cleared their local data.

| **Purpose** | Validate a Lemon Squeezy license key and unlock the app |
| --- | --- |
| **Fields** | License Key input (text, required, auto-uppercase, 32-char limit) |
| **Validation** | Real-time regex: RESELLER-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4} |
| **CTA** | Primary button: 'VERIFY & UNLOCK APP' (disabled until valid format) |
| **States** | Default / Loading (spinner + 'Verifying...') / Error (red inline) / Success (toast + redirect) |
| **Upsell** | Subtle footer text: 'Upgrade to Pro later to sync eBay automatically' |

## **2. Dashboard (/dashboard)**

The home screen — shows the user's overall business health at a glance.

| **Metric Cards (row 1)** | Total Profit (all time) · Items In Stock |
| --- | --- |
| **Metric Cards (row 2)** | Total Items Sold · This Month's Profit |
| **Chart** | Monthly profit trend — 6-month rolling line chart (Recharts) |
| **Platform Breakdown** | Pie chart: % of sales revenue per platform (eBay / Vinted / Depop) |
| **Recent Sales List** | Last 10 sales — item title + sale price, tap to view detail |
| **Actions** | Floating '+ Add Item' button · Links to Inventory and Sales |
| **Pull to refresh** | Reloads all metrics from SQLite |

## **3. Add Item (/add-item)**

Mobile-first form for logging a newly purchased item. Optimised for fast entry at a market or charity shop.

| **Field** | **Required** | **Type** | **Notes** |
| --- | --- | --- | --- |
| Photo | No | Camera / upload | Compressed to WebP, max 1200px, stored in OPFS |
| Title | Yes | Text | 3–255 chars, auto-focused on load |
| Description | No | Textarea | Optional listing copy, max 1000 chars |
| Condition | Yes | Select | new / like-new / good / fair / poor |
| Purchase Price | Yes | Currency | Stored as pence internally |
| Purchase Date | Yes | Date picker | Defaults to today |
| Platform | Yes | Select | ebay / vinted / depop / other |
| Storage Location | No | Text | Free-form (e.g. 'Shelf A') |
| Status | Yes | Radio | Listed / Unlisted / Undelivered |
| Notes | No | Textarea | Internal notes, collapsed by default |

| **Primary CTA** | SAVE ITEM → navigate to /inventory |
| --- | --- |
| **Secondary CTA** | SAVE & ADD ANOTHER → reset form, stay on page |
| **Photo flow** | 1. Compress to WebP 70% quality 2. Store in OPFS 3. Save path in SQLite |
| **Upsell hook** | Below platform selector: '✨ Pro: auto-link your eBay listing and track sold price' |

## **4. Inventory (/inventory)**

Browsable list of all items. Filterable and searchable.

| **Search** | Debounced (300ms) title search — case-insensitive |
| --- | --- |
| **Filter: Status** | All / Listed / Unlisted / Undelivered / Sold |
| **Filter: Platform** | All / eBay / Vinted / Depop / Other |
| **Sort** | Newest / Price low-high / Price high-low / Listed first |
| **Item card** | Thumbnail + title + purchase price + status badge + platform + storage |
| **Tap item** | Navigate to /inventory/[id] (detail view) |
| **Long-press item** | Context menu: Edit / Mark as Sold / Delete |
| **Pagination** | Infinite scroll — load 20 items at a time from SQLite |

## **5. Mark as Sold (Modal / /sales/log)**

Triggered from the item detail screen or long-press context menu.

| **Field** | **Required** | **Type** | **Notes** |
| --- | --- | --- | --- |
| Sale Price | Yes | Currency | Gross sale amount (what buyer paid) |
| Sale Date | Yes | Date picker | Defaults to today |
| Platform | Yes | Select | Pre-filled from item, editable |
| Postage Cost | No | Currency | Deducted from profit if entered |
| Platform Fee % | Yes | Number | Pre-filled from settings, editable per sale |
| Notes | No | Text | Optional sale note |

Live profit preview updates as the user types — shows: Sale Price, minus Fee, minus Postage, minus Purchase Price = Net Profit (green if positive, red if negative).

## **6. Expenditures (/expenditures)**

Log and track business costs: packaging, subscriptions, storage, shipping supplies.

| **List view** | All expenditures sorted by date DESC, grouped by month |
| --- | --- |
| **Add form fields** | Category / Description / Amount / Date / Recurrence (none→annual) |
| **Totals** | This month total · This tax year total (shown as header cards) |
| **Categories** | Packaging · Storage · Subscription · Shipping · Other |

## **7. Monthly Statistics (/statistics)**

| **Chart 1** | Monthly profit — bar chart, last 12 months |
| --- | --- |
| **Chart 2** | Items sold per month — line chart overlay |
| **Chart 3** | Platform breakdown per month — stacked bar |
| **Summary table** | Month · Items Sold · Total Sales · Total Profit · Expenses · Net |
| **Date range** | User can select rolling 3/6/12 months or custom date range |

## **8. Tax Year Summary (/tax-summary)**

Designed for UK self-assessment — shows the numbers an accountant or HMRC needs.

| **Tax year period** | 6 Apr YYYY to 5 Apr YYYY+1 (configurable in settings) |
| --- | --- |
| **Income (Gross Sales)** | Sum of all sale_price_pence in the tax year |
| **Platform Fees** | Sum of all platform_fee_pence |
| **Postage Costs** | Sum of postage_cost_pence |
| **Business Expenses** | Sum of expenditures.amount_pence |
| **Net Profit** | Gross Sales − Fees − Postage − Expenses |
| **Export** | Export as CSV · Print-friendly view |
| **Disclaimer** | Footer note: 'For guidance only. Consult a qualified accountant for tax advice.' |

## **9. Settings (/settings)**

| **Platform Fees** | eBay % / Vinted % / Depop % — editable number inputs |
| --- | --- |
| **Currency** | GBP (V1 only — multi-currency is a Pro feature) |
| **Tax Year Dates** | Start month (default: April) and day (default: 6th) |
| **Export All Data** | Download full SQLite export as CSV zip |
| **Clear All Data** | Destructive action — requires typing CONFIRM before proceeding |
| **App Version** | Displayed for support purposes |
| **Pro Upsell Banner** | Persistent card: 'Upgrade to Pro — sync eBay, cloud backup, AI pricing' |

# **Project File Structure**

**reseller-tracker-v1/**

├── public/ ← PWA manifest, icons, screenshots

├── src/

│ ├── app/ ← Next.js App Router pages

│ │ ├── (auth)/activate/page.tsx

│ │ ├── (app)/dashboard/page.tsx

│ │ ├── (app)/inventory/page.tsx

│ │ ├── (app)/inventory/[id]/page.tsx

│ │ ├── (app)/add-item/page.tsx

│ │ ├── (app)/sales/page.tsx

│ │ ├── (app)/expenditures/page.tsx

│ │ ├── (app)/statistics/page.tsx

│ │ ├── (app)/tax-summary/page.tsx

│ │ ├── (app)/settings/page.tsx

│ │ └── api/validate-key/route.ts ← Server-side Lemon Squeezy call

│ ├── components/

│ │ ├── ui/ ← Button, Input, Modal, Select, Toast

│ │ ├── forms/ ← ActivationForm, AddItemForm, SalesLogForm

│ │ ├── sections/ ← DashboardMetrics, InventoryTable, ProfitChart

│ │ └── layout/ ← Navigation, Header, BottomNav

│ └── lib/

│ ├── db/ ← SQLite init, schema, migrations, queries/

│ ├── activation/ ← Lemon Squeezy client, validator, storage

│ ├── calculations/ ← profit.ts, fees.ts, tax.ts

│ ├── export/ ← csv.ts, formatters.ts

│ ├── hooks/ ← useInventory, useSales, useCamera, useOffline

│ └── types/ ← TypeScript interfaces for all entities

├── package.json

├── next.config.ts ← PWA plugin config

└── tailwind.config.ts

# **Upsell Hooks — V1 → Pro**

Pro subscription (£6.99/month) is introduced subtly throughout V1 without being intrusive. These are the exact locations where upsell messages appear:

| **Location** | **Upsell Message** |
| --- | --- |
| Activation screen footer | 'Upgrade to Pro later to sync eBay and Vinted automatically' |
| Add Item — below platform select | '✨ Pro: auto-link your eBay listing and track the sold price instantly' |
| Dashboard — below platform chart | '🔄 Pro: sync sales from eBay automatically — no manual entry' |
| Inventory — empty state | '💡 Pro users can scan barcodes and import eBay listings directly' |
| Statistics — top of page | '📈 Pro: unlock AI-powered pricing suggestions based on recent sold prices' |
| Settings — persistent banner | 'Upgrade to Pro — eBay/Vinted sync · Cloud backup · AI pricing · Multi-device' |
| Tax Summary — export section | '☁️ Pro: automatic cloud backup so your data is safe even if you clear your browser' |

## **Pro Features (Future V2)**

1. eBay API sync — auto-import sold items and prices
2. Vinted CSV import (no public API currently)
3. Cloud backup + multi-device sync (Supabase)
4. AI pricing suggestions via OpenAI API
5. Barcode scanning for quick item lookup
6. Push notifications: 'Item listed 90 days — consider reducing price'
7. Multi-currency support
8. Advanced analytics: sell-through rate, avg days to sell, top categories

# **Build & Distribution**

## **Development Setup**

1. Clone repo, run npm install
2. Create .env.local with LEMONSQUEEZY_API_KEY and LEMONSQUEEZY_STORE_ID
3. Run npm run dev — Next.js dev server at localhost:3000
4. Open on mobile by visiting your local IP (e.g. 192.168.x.x:3000) — PWA installs in dev mode

## **Production Deployment**

1. Push to GitHub
2. Connect repo to Vercel (free tier)
3. Add environment variables (Lemon Squeezy keys) in Vercel dashboard
4. Vercel auto-deploys on push — app is live at your-app.vercel.app
5. Point your custom domain (e.g. resellertracker.co.uk) to Vercel

## **PWA Installation — User Flow**

iOS (Safari): tap the Share button → 'Add to Home Screen' → app icon appears on home screen, launches full-screen

Android (Chrome): tap the three-dot menu → 'Add to Home Screen' OR Chrome shows an automatic install banner after a few visits

Desktop (Chrome/Edge): install icon appears in the address bar — installs as a standalone app in the taskbar/dock

## **Lemon Squeezy Setup**

1. Create a Lemon Squeezy account and product (digital download, one-time price)
2. Enable 'License Keys' for the product in Lemon Squeezy settings
3. Set max activations = 1 per key
4. Add the activation URL to the purchase confirmation email
5. Create a simple landing page (can be a free Notion page or Carrd.co) linking to the Lemon Squeezy checkout

## **Selling Channels**

1. Your own landing page → Lemon Squeezy checkout (0% platform fee beyond LS's ~5%)
2. Etsy listing (digital download) — Etsy takes 6.5% but gives you organic search traffic
3. TikTok / Instagram content targeting eBay/Vinted resellers — direct to your landing page

# **Build Timeline (Estimated)**

| **Week** | **Focus** | **Deliverables** |
| --- | --- | --- |
| Week 1 | Foundation | Next.js + Tailwind setup, SQLite/OPFS init, schema migrations, route structure |
| Week 2 | Activation | Lemon Squeezy integration, activation screen, middleware auth guard, token storage |
| Week 3 | Core CRUD | Add Item form (with camera), Inventory list, Item detail, soft delete |
| Week 4 | Sales & Profit | Mark as Sold modal, profit calculation engine, live profit preview |
| Week 5 | Dashboard | Metric cards, monthly chart (Recharts), platform pie chart, recent sales list |
| Week 6 | Reporting | Monthly stats page, Tax Year summary, CSV export |
| Week 7 | Polish | Expenditures, Settings, offline indicator, PWA manifest + icons, install prompts |
| Week 8 | QA & Launch | Cross-device testing (iOS/Android/Desktop), Vercel deploy, Lemon Squeezy product setup |

| *A solo developer with Next.js experience can ship this in 6–8 weeks. The most complex parts are the SQLite/OPFS setup (Days 1–3) and the Lemon Squeezy activation flow (Days 4–6). Everything else is standard React form/list/chart work.* |
| --- |
