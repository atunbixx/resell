**RESELLER TRACKER**

V1 PWA — Technical Specification

**REVISED — Senior Architect Review Applied**

*One-Time Purchase · Mobile-First · Offline-Capable · £35–49*

| **Platform**<br>PWA (iOS + Android + Desktop) | **Database**<br>SQLite (OPFS + IndexedDB fallback) | **Licensing**<br>Lemon Squeezy (JWT-signed) | **Price**<br>£35–49 one-time |
| --- | --- | --- | --- |

# **Executive Summary**

Reseller Tracker is a one-time-purchase Progressive Web App (£35–49) for UK resellers managing inventory and sales across eBay, Vinted, and Depop. All data lives locally on the user’s device via SQLite — no accounts, no cloud subscription, no ongoing server costs.

This specification covers the full V1 architecture: screen-by-screen UX, database schema, activation flow, offline strategy, profit calculation logic, component architecture, testing strategy, performance budgets, and the upsell hooks for converting to a future Pro subscription.

| *Design principle: beat the £5.50 Google Sheet by doing everything it does — plus photos, auto fee calculation, monthly charts, mobile-first UX, and data backup/restore — while keeping zero ongoing cost to the buyer.* |
| --- |

# **Why This Beats the Spreadsheet**

| **The £5.50 Google Sheet** | **Reseller Tracker PWA** |
| --- | --- |
| Manual data entry only | Quick-add from phone in <10 seconds with camera |
| No photo storage | Attach photos from camera or gallery per item |
| Google Sheets mobile is clunky | Mobile-first PWA, installed to home screen |
| No fee auto-calculation | eBay 12.8% / Vinted 5% / Depop 10% auto-deducted |
| UK tax year only, static formulas | Dynamic tax summary, configurable dates and fees |
| One-time £5.50, easy to copy/share | £35–49, JWT-signed activation tied to device |
| No export — data locked in Google Drive | CSV export, manual backup/restore, works offline |
| No data safety if Google deletes file | Local SQLite + manual backup export to file |

# **Tech Stack**

## **Why PWA over Native App**

A PWA installs onto the user’s phone like a native app — home screen icon, works fully offline, accesses the device camera. It bypasses the App Store entirely:

1. No Apple 30% or Google 15–30% cut on the £39 sale
2. Activation codes work freely (Apple bans external payment in native iOS apps)
3. No app store review delays — ship updates instantly
4. One codebase for iOS, Android, and Desktop

## **Stack Overview (Revised)**

| *ARCHITECTURAL CHANGE: Vite + React SPA replaces Next.js. Next.js is SSR-first — unnecessary for a fully offline, local-data app. The only server-side need is one license validation endpoint, which becomes a standalone Vercel Edge Function. This reduces bundle size by ~40% and eliminates SSR hydration bugs.* |
| --- |

| **Layer** | **Technology** | **Reason** |
| --- | --- | --- |
| Web Framework | Vite 6 + React 19 | SPA-first, fast HMR, smaller bundle than Next.js |
| Language | TypeScript | Type safety across DB schema, API, and UI |
| Styling | Tailwind CSS v4 | Fast, consistent, mobile-first utility classes |
| Local Database | SQLite via wa-sqlite (OPFS) + sql.js (IndexedDB fallback) | Full SQL on-device with iOS Safari fallback |
| State Management | Zustand | Lightweight global state for activation and UI |
| Charts | Recharts | Free, React-native, no external dependencies |
| Forms | React Hook Form + Zod | Fast validation, TypeScript-first schema definitions |
| Icons | Lucide React | Consistent, lightweight icon set |
| Service Worker | Workbox (vite-plugin-pwa) | Offline caching, background sync hooks for V2 |
| Routing | React Router v7 | Client-side SPA routing |
| License Validation | Vercel Edge Function (standalone) | Single serverless endpoint, no framework needed |
| Payments + Licensing | Lemon Squeezy | Built-in license key gen + free validation API |
| Hosting | Vercel (free tier) | Global CDN, Edge Functions included |
| Error Monitoring | Sentry (free tier) | Catch production bugs before users report them |
| Testing | Vitest + Playwright | Unit tests + E2E critical path tests |

## **iOS Safari Compatibility (Critical)**

| *RISK: OPFS createSyncAccessHandle() only works in Web Workers on Safari, and older iOS versions have incomplete support. This is critical for a mobile-first app targeting UK iPhone users.* |
| --- |

Mitigation: dual-storage strategy with automatic fallback.

1. On app init, attempt to open SQLite via wa-sqlite with OPFS backend
2. If OPFS fails (older Safari, unsupported browser), automatically fall back to sql.js with IndexedDB persistence
3. Both paths expose the same DatabaseService interface — the rest of the app is unaware of which backend is in use
4. Test on real iOS devices (iPhone 12+, Safari 16+) in Week 1 of development — not Week 7

| *The fallback adds ~200KB to the bundle (sql.js WASM) but guarantees the app works on every device. Only loaded if OPFS is unavailable.* |
| --- |

# **Database Schema (SQLite)**

All data stored in a single SQLite database inside the browser’s Origin Private File System (OPFS) or IndexedDB fallback. All monetary values stored as integers (pence) to avoid floating-point rounding.

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
| storage_location | TEXT | No | Free-form (e.g. Shelf A, Box 3) |
| status | TEXT | Yes | listed / unlisted / undelivered / sold |
| photo_uri | TEXT | No | OPFS file path (items/{uuid}.webp) |
| notes | TEXT | No | Internal notes, max 500 chars |
| created_at | TIMESTAMP | Yes | Auto-set on insert |
| updated_at | TIMESTAMP | Yes | Auto-set on insert and update |
| deleted_at | TIMESTAMP | No | Soft delete — null = active |

Indexes: idx_items_platform, idx_items_status, idx_items_created_at

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
| postage_cost_pence | INTEGER | No | Optional shipping cost deducted |
| profit_pence | INTEGER | Yes | Net profit (see formula section) |
| notes | TEXT | No | Optional sale notes |
| created_at | TIMESTAMP | Yes | Auto-set on insert |

Indexes: idx_sales_item_id, idx_sales_platform, idx_sales_sale_date

## **Table: expenditures (Simplified)**

| *CHANGE: Removed recurrence field from V1. Users add each expense manually. Recurring entries add complexity (where does the scheduler run in an offline PWA?) with minimal V1 value. Recurrence will be added in V2 Pro with server-side scheduling.* |
| --- |

| **Column** | **Type** | **Required** | **Notes** |
| --- | --- | --- | --- |
| id | TEXT (UUID) | Yes | Primary key |
| category | TEXT | Yes | packaging / storage / subscription / shipping / other |
| description | TEXT | Yes | What was bought/paid |
| amount_pence | INTEGER | Yes | Amount in pence |
| transaction_date | DATE | Yes | When the cost was incurred |
| notes | TEXT | No | Optional |
| created_at | TIMESTAMP | Yes | Auto-set on insert |

## **Table: settings**

| **Key** | **Default Value** | **Description** |
| --- | --- | --- |
| platform_fee_ebay | 12.8 | eBay fee % (user-editable) |
| platform_fee_vinted | 5.0 | Vinted fee % (user-editable) |
| platform_fee_depop | 10.0 | Depop fee % (user-editable) |
| currency | GBP | Display currency symbol |
| tax_year_start_month | 4 | UK: April |
| tax_year_start_day | 6 | UK: 6th April |
| app_version | 1.0.0 | For migration checks |
| db_schema_version | 1 | Tracks schema version for migrations |

## **Table: app_state**

Single-row table (id always = 1) storing activation and metadata.

| **Column** | **Type** | **Notes** |
| --- | --- | --- |
| id | INTEGER (1) | Enforced single row: CHECK (id = 1) |
| activation_jwt | TEXT | Signed JWT from Lemon Squeezy validation |
| activation_key_hash | TEXT | SHA-256 hash of the original key |
| activation_date | TIMESTAMP | When the key was first activated |
| license_valid_until | TIMESTAMP | NULL = lifetime licence (V1 default) |
| storage_backend | TEXT | opfs or indexeddb — recorded for diagnostics |

## **Schema Migrations**

The db_schema_version setting tracks the current schema version. On app startup, the DatabaseService compares the stored version against the app’s expected version and runs any pending migration scripts sequentially. Each migration is an idempotent SQL script stored in lib/db/migrations/ with the naming convention 001_initial.sql, 002_add_column.sql, etc.

# **Profit Calculation Logic**

## **Formula**

| *Net Profit = Sale Price − Platform Fee − Postage Cost − Purchase Price* |
| --- |

1. Platform Fee (pence) = ROUND(sale_price_pence × (platform_fee_percent / 100))
2. Net Profit (pence) = sale_price_pence − platform_fee_pence − postage_cost_pence − purchase_price_pence
3. Display: divide pence by 100, format to 2 decimal places with £ prefix

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

Fees are pre-set in settings and user-editable. A snapshot is stored on each sale record so historical profit stays accurate if the user later changes the fee.

| **Platform** | **Default Fee** | **Notes** |
| --- | --- | --- |
| eBay | 12.8% | Final value fee (typical UK) |
| Vinted | 5.0% | Buyer protection fee |
| Depop | 10.0% | Standard seller fee |
| Other | 0.0% | User sets manually per sale |

# **Activation & Licensing**

## **Overview**

Lemon Squeezy handles payments and generates a unique license key per purchase. The app makes one online check at first launch. After that, the app works fully offline forever.

## **Step-by-Step Flow**

1. Customer purchases on your Lemon Squeezy product page
2. Lemon Squeezy emails a license key (format: RESELLER-XXXX-XXXX-XXXX)
3. Customer navigates to your PWA URL and taps Add to Home Screen
4. App detects no activation token → redirects to /activate
5. Customer enters their license key
6. App validates format client-side, then calls Vercel Edge Function (/api/validate-key)
7. Edge Function calls Lemon Squeezy API, verifies key, marks as activated (max 1 activation)
8. Edge Function returns a signed JWT containing: key hash, activation timestamp, expiry (null = lifetime)
9. App stores JWT in IndexedDB + SQLite app_state → redirects to /dashboard
10. All future launches: read JWT from IndexedDB, verify signature client-side — no network call

## **JWT-Based Activation (Revised)**

| *ARCHITECTURAL CHANGE: Plain activation tokens replaced with signed JWTs. PWA source code is visible in DevTools — a boolean check is trivially bypassable. JWTs signed with a private key on the server and verified with a public key on the client are significantly harder to forge.* |
| --- |

Server-side (Vercel Edge Function): signs a JWT with a private key containing the key hash, activation date, and device fingerprint hint. Client-side: verifies JWT signature using a hardcoded public key. Even if a user finds where the JWT is checked, they cannot forge a valid JWT without the private key.

Additional hardening: Vite production builds use minification with mangled variable names by default. The activation gate logic is split across multiple modules to make tampering harder.

## **Edge Cases**

| **Scenario** | **Behaviour** |
| --- | --- |
| No internet on first launch | Clear error: Internet connection needed to activate. Try again when online. |
| Key already used | Error: This key has been activated on another device. Contact support. |
| Invalid key format | Real-time inline validation — button disabled until regex matches |
| 5+ failed attempts | 15-minute cooldown via localStorage timestamp |
| User clears browser data | Token lost — must re-activate (see Data Backup section) |
| Lemon Squeezy API down | Graceful error: Cannot verify right now. Try again shortly. |

## **Rate Limiting (Server-Side)**

The Vercel Edge Function enforces rate limiting: max 10 validation attempts per IP per hour. This prevents brute-force key guessing and is implemented via Vercel’s built-in rate limiting headers. The client-side 5-attempt cooldown is a UX courtesy; the server-side limit is the real enforcement.

# **Data Backup & Restore**

| *CRITICAL ADDITION: Without backup, users lose all business data if they clear browser data, reset their phone, or iOS evicts PWA storage after 7 days of non-use. For a £39 paid product, data loss = refund requests and 1-star reviews.* |
| --- |

## **Manual Backup (Export)**

1. User taps Settings → Backup & Restore → Export Backup
2. App serialises the full SQLite database to a JSON file (all tables, all rows)
3. File saved via the Web Share API / download as reseller-backup-2026-03-22.json
4. User stores the file wherever they want (iCloud, Google Drive, email to self)

Backup file format: JSON with a version field, schema version, and all table data. Photos are base64-encoded inline (increases file size but ensures full portability). Typical file size for 500 items with photos: ~50–100MB.

## **Restore**

1. User taps Settings → Backup & Restore → Import Backup
2. Selects the .json backup file from their device
3. App validates the file structure and schema version
4. If schema version matches: direct import. If older: run migrations on the data first.
5. Confirmation prompt: This will replace all current data. Are you sure?
6. Data restored, app reloads

## **Backup Reminder**

After every 50 new items or 30 days since last backup (whichever comes first), the app shows a non-blocking banner: Your data is stored locally. Back up now to keep it safe. This is dismissible but reappears on the next trigger.

# **PWA Offline Strategy**

## **What Works Offline**

| **Feature** | **Offline** | **Online** |
| --- | --- | --- |
| View dashboard and charts | Yes (SQLite) | Yes |
| Browse inventory | Yes (SQLite) | Yes |
| Add new item (with photo) | Yes | Yes |
| Log a sale | Yes | Yes |
| Add expenditure | Yes | Yes |
| Export to CSV | Yes (local) | Yes |
| Monthly statistics | Yes | Yes |
| Tax year summary | Yes | Yes |
| Backup export | Yes (local file) | Yes |
| Backup restore | Yes (local file) | Yes |
| Activate license key | No — requires network | Yes |

## **Caching Strategy**

1. **Static assets (JS, CSS, icons): **Cache-first via Workbox — served from cache, updated in background
2. **License validation (/api/validate-key): **Network-only — never cached
3. **SQLite database: **Fully local (OPFS/IndexedDB) — no caching needed

| *Offline indicator: a persistent yellow banner appears at screen bottom when offline, reassuring users their data is safe.* |
| --- |

## **iOS PWA Storage Eviction**

| *iOS Safari can evict PWA storage after ~7 days of non-use. This means if a user doesn't open the app for a week, their database could be wiped silently.* |
| --- |

Mitigations:

1. Request persistent storage on first launch: navigator.storage.persist()
2. Backup reminder system (see Data Backup section) encourages regular exports
3. On app launch, if database is empty but activation token exists, show: Your data may have been cleared by your browser. Restore from a backup in Settings.

# **Screen Specifications**

## **1. Activation Screen (/activate)**

| **Item** | **Detail** |
| --- | --- |
| Purpose | Validate a Lemon Squeezy license key and unlock the app |
| Fields | License Key input (text, auto-uppercase, 32-char limit) |
| Validation | Real-time regex: RESELLER-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4} |
| CTA | Primary: VERIFY & UNLOCK APP (disabled until valid format) |
| States | Default / Loading (spinner) / Error (red inline) / Success (toast + redirect) |
| Upsell | Footer text: Upgrade to Pro later to sync eBay automatically |

## **2. Dashboard (/dashboard)**

| **Item** | **Detail** |
| --- | --- |
| Metric Cards Row 1 | Total Profit (all time) · Items In Stock |
| Metric Cards Row 2 | Total Items Sold · This Month Profit |
| Chart | Monthly profit trend — 6-month rolling line chart (Recharts) |
| Platform Breakdown | Pie chart: % of revenue per platform |
| Recent Sales | Last 10 sales — tap to view detail |
| Actions | Floating + Add Item button · Links to Inventory and Sales |
| Pull to refresh | Reloads all metrics from SQLite |

## **3. Add Item (/add-item)**

Mobile-first form optimised for fast entry at markets and charity shops.

| **Field** | **Required** | **Type** | **Notes** |
| --- | --- | --- | --- |
| Photo | No | Camera / upload | Compressed to WebP, max 1200px, stored in OPFS |
| Title | Yes | Text | 3–255 chars, auto-focused |
| Description | No | Textarea | Optional, max 1000 chars |
| Condition | Yes | Select | new / like-new / good / fair / poor |
| Purchase Price | Yes | Currency | Stored as pence internally |
| Purchase Date | Yes | Date picker | Defaults to today |
| Platform | Yes | Select | ebay / vinted / depop / other |
| Storage Location | No | Text | Free-form (Shelf A, Box 3) |
| Status | Yes | Radio | Listed / Unlisted / Undelivered |
| Notes | No | Textarea | Collapsed by default |

| **Item** | **Detail** |
| --- | --- |
| Primary CTA | SAVE ITEM → navigate to /inventory |
| Secondary CTA | SAVE & ADD ANOTHER → reset form, stay on page |
| Photo compression | WebP 70% quality, max 1200px, stored in OPFS |
| Upsell | Below platform: Pro: auto-link your eBay listing |

## **4. Inventory (/inventory)**

| **Item** | **Detail** |
| --- | --- |
| Search | Debounced (300ms) title search, case-insensitive |
| Filter: Status | All / Listed / Unlisted / Undelivered / Sold |
| Filter: Platform | All / eBay / Vinted / Depop / Other |
| Sort | Newest / Price low-high / Price high-low / Listed first |
| Item card | Thumbnail + title + price + status badge + platform + storage |
| Tap item | Navigate to /inventory/[id] detail view |
| Long-press | Context menu: Edit / Mark as Sold / Delete |
| Pagination | Infinite scroll, 20 items per load |

## **5. Mark as Sold (Modal)**

| **Field** | **Required** | **Type** | **Notes** |
| --- | --- | --- | --- |
| Sale Price | Yes | Currency | Gross amount (what buyer paid) |
| Sale Date | Yes | Date picker | Defaults to today |
| Platform | Yes | Select | Pre-filled from item, editable |
| Postage Cost | No | Currency | Deducted from profit |
| Platform Fee % | Yes | Number | Pre-filled from settings, editable per sale |
| Notes | No | Text | Optional |

Live profit preview updates as user types: Sale Price − Fee − Postage − Purchase = Net Profit (green if positive, red if negative).

## **6. Expenditures (/expenditures)**

| **Item** | **Detail** |
| --- | --- |
| List view | All expenses sorted by date DESC, grouped by month |
| Add form | Category / Description / Amount / Date |
| Totals | This month total · This tax year total (header cards) |
| Categories | Packaging · Storage · Subscription · Shipping · Other |

## **7. Monthly Statistics (/statistics)**

| **Item** | **Detail** |
| --- | --- |
| Chart 1 | Monthly profit — bar chart, last 12 months |
| Chart 2 | Items sold per month — line overlay |
| Chart 3 | Platform breakdown per month — stacked bar |
| Summary table | Month · Items Sold · Sales · Profit · Expenses · Net |
| Date range | Rolling 3/6/12 months or custom range |

## **8. Tax Year Summary (/tax-summary)**

| **Item** | **Detail** |
| --- | --- |
| Tax year period | 6 Apr YYYY to 5 Apr YYYY+1 (configurable) |
| Income | Sum of all sale_price_pence |
| Platform Fees | Sum of platform_fee_pence |
| Postage Costs | Sum of postage_cost_pence |
| Business Expenses | Sum of expenditures amount_pence |
| Net Profit | Income − Fees − Postage − Expenses |
| Export | CSV export · Print-friendly view |
| Disclaimer | For guidance only. Consult a qualified accountant. |

## **9. Settings (/settings)**

| **Item** | **Detail** |
| --- | --- |
| Platform Fees | eBay % / Vinted % / Depop % — editable |
| Currency | GBP (V1 only — multi-currency is Pro) |
| Tax Year Dates | Start month and day (default: 6 April) |
| Backup & Restore | Export backup (JSON) / Import backup |
| Export All Data as CSV | Download all tables as CSV zip |
| Clear All Data | Requires typing CONFIRM |
| App Version | Displayed for support |
| Pro Upsell Banner | Persistent card: Upgrade to Pro |

# **Project File Structure**

**reseller-tracker-v1/** (Vite + React SPA)

├── public/ ← PWA manifest, icons, screenshots

├── api/ ← Vercel Edge Functions (standalone)

│ └── validate-key.ts ← Lemon Squeezy license validation + JWT signing

├── src/

│ ├── main.tsx ← Entry point, router setup

│ ├── App.tsx ← Root component, auth guard

│ ├── pages/

│ │ ├── Activate.tsx

│ │ ├── Dashboard.tsx

│ │ ├── AddItem.tsx

│ │ ├── Inventory.tsx

│ │ ├── ItemDetail.tsx

│ │ ├── Sales.tsx

│ │ ├── Expenditures.tsx

│ │ ├── Statistics.tsx

│ │ ├── TaxSummary.tsx

│ │ └── Settings.tsx

│ ├── components/

│ │ ├── ui/ ← Button, Input, Modal, Select, Toast

│ │ ├── forms/ ← ActivationForm, AddItemForm, SalesLogForm

│ │ ├── sections/ ← DashboardMetrics, InventoryTable, ProfitChart

│ │ └── layout/ ← Navigation, Header, BottomNav, OfflineIndicator

│ └── lib/

│ ├── db/

│ │ ├── index.ts ← DatabaseService (OPFS + IndexedDB fallback)

│ │ ├── schema.ts ← CREATE TABLE statements

│ │ ├── migrations/ ← 001_initial.sql, 002_xxx.sql, ...

│ │ └── queries/ ← items.ts, sales.ts, expenditures.ts, aggregations.ts

│ ├── activation/

│ │ ├── api-client.ts ← Calls Vercel Edge Function

│ │ ├── jwt-verify.ts ← Client-side JWT verification with public key

│ │ └── storage.ts ← IndexedDB token persistence

│ ├── calculations/ ← profit.ts, fees.ts, tax.ts

│ ├── backup/ ← export.ts, import.ts, validator.ts

│ ├── export/ ← csv.ts, formatters.ts

│ ├── hooks/ ← useInventory, useSales, useCamera, useOffline, useBackup

│ ├── stores/ ← Zustand: activation.store.ts, ui.store.ts

│ └── types/ ← database.ts, domain.ts, api.ts

├── tests/

│ ├── unit/ ← Vitest: profit.test.ts, fees.test.ts, tax.test.ts

│ └── e2e/ ← Playwright: activation.spec.ts, add-sell-item.spec.ts

├── package.json

├── vite.config.ts ← PWA plugin, build config

├── tsconfig.json

└── tailwind.config.ts

# **Testing Strategy**

| *CRITICAL ADDITION: No tests were in the original spec. For a paid product handling financial data, untested profit calculations or fee logic bugs directly cost your users money and your reputation.* |
| --- |

## **Unit Tests (Vitest)**

Pure function tests for the core business logic. These are fast, run in CI, and catch regressions early.

1. profit.ts — test net profit formula with edge cases: zero sale, negative profit, rounding
2. fees.ts — test each platform fee calculation, custom fee overrides, boundary values
3. tax.ts — test UK tax year date boundaries (5 April edge case), cross-year calculations
4. csv.ts — test export format with special characters, large datasets, empty data
5. backup/validator.ts — test backup file validation, schema version mismatch handling

## **E2E Tests (Playwright)**

Critical user path tests that run in a real browser. These catch integration bugs between components.

1. Activation flow: enter valid key → verify → land on dashboard
2. Add item → mark as sold → verify profit on dashboard matches expected calculation
3. Export backup → clear data → restore backup → verify data intact
4. Offline mode: disconnect network → add item → verify saved → reconnect

## **Performance Budget**

| *CRITICAL ADDITION: PWAs live or die by Lighthouse scores. A poor score blocks the browser install prompt on Android.* |
| --- |

| **Metric** | **Target** | **Why It Matters** |
| --- | --- | --- |
| Lighthouse PWA Score | 95+ | Required for reliable Add to Home Screen prompt |
| First Contentful Paint | < 1.5s | Users abandon slow-loading apps |
| Bundle Size (gzipped) | < 500KB | Fast load on 3G (resellers at car boots may have poor signal) |
| Time to Interactive | < 2.0s | App must feel instant |
| SQLite Init Time | < 500ms | Database must be ready before first render |

Run Lighthouse CI in the deployment pipeline. Block deploys that drop below targets.

# **Error Monitoring**

| *CRITICAL ADDITION: Without monitoring, you only learn about bugs when users leave 1-star reviews. Sentry free tier gives you 5,000 errors/month — more than enough for V1.* |
| --- |

## **Sentry Integration**

1. Initialise Sentry in main.tsx with environment and release version tags
2. Capture all unhandled exceptions and promise rejections automatically
3. Add custom breadcrumbs for key user actions: item added, sale logged, backup exported
4. Tag errors with storage backend (opfs vs indexeddb) for iOS debugging
5. Redact all financial data from error reports (never send pence values to Sentry)

Privacy: Sentry is opt-in. On first launch after activation, show a one-time prompt: Help us improve by sharing anonymous crash reports? Users can toggle this in Settings at any time.

# **Upsell Hooks — V1 → Pro**

Pro subscription (£6.99/month) introduced subtly throughout V1. Never blocking, always dismissible.

| **Location** | **Upsell Message** |
| --- | --- |
| Activation footer | Upgrade to Pro later to sync eBay and Vinted automatically |
| Add Item (below platform) | Pro: auto-link your eBay listing and track sold price |
| Dashboard (below chart) | Pro: sync sales from eBay automatically — no manual entry |
| Inventory (empty state) | Pro users can scan barcodes and import eBay listings |
| Statistics (top of page) | Pro: AI-powered pricing suggestions based on sold prices |
| Settings (persistent card) | Upgrade to Pro — eBay sync · Cloud backup · AI pricing |
| Tax Summary (export area) | Pro: automatic cloud backup keeps data safe |

## **Pro Features (Future V2)**

1. eBay API sync — auto-import sold items and prices
2. Vinted CSV import (no public API currently)
3. Cloud backup + multi-device sync (Supabase)
4. AI pricing suggestions via OpenAI API
5. Barcode scanning for quick item lookup
6. Push notifications: item listed 90 days — reduce price?
7. Multi-currency support
8. Advanced analytics: sell-through rate, avg days to sell
9. Recurring expenditures with server-side scheduling

# **Build & Distribution**

## **Development Setup**

1. Clone repo, run npm install
2. Create .env.local with LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, JWT_PRIVATE_KEY
3. Run npm run dev — Vite dev server at localhost:5173
4. Test on mobile via local IP (192.168.x.x:5173)

## **Production Deployment**

1. Push to GitHub
2. Connect repo to Vercel (free tier)
3. Add environment variables in Vercel dashboard
4. Vercel auto-deploys: SPA to CDN, Edge Function for /api/validate-key
5. Point custom domain (e.g. resellertracker.co.uk) to Vercel

## **PWA Installation — User Flow**

iOS (Safari): Share button → Add to Home Screen → full-screen app icon

Android (Chrome): three-dot menu → Add to Home Screen, or automatic install banner

Desktop (Chrome/Edge): install icon in address bar → standalone taskbar/dock app

## **Lemon Squeezy Setup**

1. Create Lemon Squeezy account and product (digital, one-time price)
2. Enable License Keys for the product
3. Set max activations = 1 per key
4. Generate JWT keypair: store private key in Vercel env, hardcode public key in app
5. Create landing page linking to Lemon Squeezy checkout

## **Selling Channels**

1. Your landing page → Lemon Squeezy checkout (only ~5% fee)
2. Etsy listing (digital download) — 6.5% but organic search traffic
3. TikTok / Instagram content targeting eBay/Vinted resellers

# **Build Timeline (8 Weeks)**

| **Week** | **Focus** | **Deliverables** |
| --- | --- | --- |
| Week 1 | Foundation + iOS Testing | Vite + React + Tailwind setup, SQLite dual-storage (OPFS + IndexedDB fallback), test on real iOS devices, route structure |
| Week 2 | Activation | Vercel Edge Function, JWT signing/verification, activation screen, auth guard, Sentry init |
| Week 3 | Core CRUD | Add Item form (with camera + WebP compression), Inventory list, Item detail, soft delete |
| Week 4 | Sales & Profit | Mark as Sold modal, profit calculation engine, live preview, unit tests for profit/fees/tax |
| Week 5 | Dashboard | Metric cards, monthly chart (Recharts), platform pie chart, recent sales list |
| Week 6 | Reporting | Monthly stats page, Tax Year summary, CSV export, backup/restore system |
| Week 7 | Polish | Expenditures, Settings, offline indicator, PWA manifest + icons, backup reminders, accessibility pass |
| Week 8 | QA & Launch | Playwright E2E tests, Lighthouse audit (target 95+), cross-device testing, Vercel deploy, Lemon Squeezy product setup |

| *A solo developer with React experience can ship this in 6–8 weeks. The riskiest parts are SQLite/OPFS setup (test on iOS in Week 1) and the JWT activation flow (Week 2). Everything else is standard React form/list/chart work.* |
| --- |

# **Appendix: Architectural Changes from V1 Draft**

Summary of all changes made during senior architect review:

| **#** | **Change** | **Rationale** |
| --- | --- | --- |
| 1 | Next.js → Vite + React SPA | No SSR needed for offline local-data app. ~40% smaller bundle. |
| 2 | Added IndexedDB/sql.js fallback for OPFS | OPFS has incomplete iOS Safari support. Cannot ship without fallback. |
| 3 | Added manual backup/restore system | Data loss on a £39 product = refund requests. Essential for trust. |
| 4 | Added Sentry error monitoring | Must know about bugs before users leave 1-star reviews. |
| 5 | Added Vitest + Playwright testing | Financial calculation bugs cost users money. Cannot ship untested. |
| 6 | Plain token → JWT-signed activation | PWA source is visible in DevTools. Boolean check is trivially bypassable. |
| 7 | Removed recurrence from V1 expenditures | No scheduler in offline PWA. Simplifies scope. Add in V2 Pro. |
| 8 | Added server-side rate limiting | Client-side cooldown is bypassable. Server enforces the real limit. |
| 9 | Added Lighthouse performance budget | PWA install prompt depends on Lighthouse score. Must target 95+. |
| 10 | Added iOS storage eviction handling | iOS evicts PWA data after 7 days non-use. Must handle gracefully. |
