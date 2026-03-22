# Reseller Tracker

Lean V1 Product + Technical Specification

## Product Intent

Reseller Tracker is a mobile-first PWA for UK resellers who want something better than a spreadsheet without paying an ongoing subscription.

V1 is optimized for:

- fast launch
- low buyer friction
- low support overhead
- strong offline behavior
- clear value over Google Sheets

V1 is not optimized for:

- complex licensing
- cross-device sync
- advanced anti-tamper protection
- automated recurring bookkeeping
- marketplace-specific integrations

## Commercial Model

Primary acquisition channel:

- Etsy discovery listing

Delivery model:

- buyer receives a PDF after Etsy purchase
- PDF contains activation URL, activation code, QR code, and short setup steps

Activation model:

- user opens the app URL
- user enters the activation code
- backend validates the code
- app stores a signed entitlement locally for offline use

Important framing:

- Etsy is a discovery and delivery channel
- Etsy is not the system of record for licensing
- the app backend is the source of truth for code status

## Lean V1 Scope

Included:

- activation screen
- dashboard
- add item
- inventory list
- mark as sold flow
- expenditures
- monthly statistics
- tax summary
- settings
- CSV export
- manual backup and restore
- offline support
- photo support with strict limits

Excluded from V1:

- direct Lemon Squeezy checkout
- subscription billing
- recurring expenditures
- cross-device sync
- collaborative use
- background jobs
- marketplace API integrations
- multiple staff accounts
- advanced anti-piracy controls
- in-app upsell mechanics

## Product Principles

1. Every screen must reduce spreadsheet friction.
2. Every important task should be possible on a phone.
3. First-use setup must be short enough to fit inside a PDF handoff.
4. The product should prefer simple manual support over fragile automation.
5. Data durability matters more than feature count.

## User Journey

1. User discovers the product on Etsy.
2. User purchases and receives a PDF.
3. PDF contains:
   - app URL
   - activation code
   - QR code
   - three setup steps
   - support email
4. User opens the app on mobile or desktop.
5. App redirects to `/activate` if no valid entitlement is stored.
6. User enters activation code.
7. Backend validates the code and returns a signed entitlement token.
8. App stores the entitlement locally.
9. User lands on the dashboard and starts adding inventory.

## Support-Minimizing Decisions

- One activation code per purchase.
- One active device per code in V1.
- Lost-device resets handled manually by support.
- No self-service license transfer in V1.
- No fingerprint-heavy device matching.
- No “security through obfuscation” requirements in the spec.
- Clear backup/export tools built into V1.
- Clear photo limits to avoid storage/support issues.

## Recommended Activation Flow

### PDF Content

The PDF should contain only:

- product name
- short value statement
- activation URL
- QR code to activation URL
- activation code
- 3 setup steps
- support contact

### App Activation Rules

- internet required on first activation only
- valid code can be redeemed once
- successful activation stores a signed token locally
- future app launches work offline
- if browser data is cleared, user must reactivate

### Backend Code Statuses

- `unused`
- `activated`
- `revoked`
- `refunded`

This is enough for V1.

## Technology Choices

### Frontend

- Vite
- React
- TypeScript
- React Router
- Zustand
- Tailwind CSS

Reason:

- fast to build
- small enough for a solo product
- no SSR complexity for an offline-first app

### Local Storage

- SQLite via wa-sqlite with OPFS where supported
- IndexedDB-based fallback where OPFS is unreliable

Reason:

- relational local data
- works offline
- realistic path for iOS/Safari compatibility

### Backend

- minimal serverless activation endpoint
- simple database table for activation codes

Reason:

- keep server responsibility narrow
- avoid building a larger backend than the product needs

### Monitoring and Tests

- basic error monitoring
- unit tests for financial logic
- a few critical-path end-to-end tests

Reason:

- enough to catch real defects
- avoids spending weeks on infrastructure before validation

## Data Model

### `items`

- `id`
- `title`
- `description`
- `purchase_price_pence`
- `purchase_date`
- `condition`
- `platform`
- `storage_location`
- `status`
- `primary_photo_uri`
- `notes`
- `created_at`
- `updated_at`
- `deleted_at`

Notes:

- keep status values simple: `unlisted`, `listed`, `sold`
- V1 should support one photo by default
- optional stretch: allow up to three photos if storage tests are acceptable

### `sales`

- `id`
- `item_id`
- `sale_price_pence`
- `sale_date`
- `platform`
- `platform_fee_percent`
- `platform_fee_pence`
- `postage_cost_pence`
- `profit_pence`
- `notes`
- `created_at`

### `expenditures`

- `id`
- `category`
- `description`
- `amount_pence`
- `transaction_date`
- `notes`
- `created_at`

### `settings`

- `platform_fee_ebay`
- `platform_fee_vinted`
- `platform_fee_depop`
- `currency`
- `tax_year_start_month`
- `tax_year_start_day`
- `db_schema_version`

### `app_state`

- `activation_token`
- `activation_code_hash`
- `activation_date`
- `storage_backend`

## Profit Logic

Formula:

`profit = sale price - platform fee - postage cost - purchase price`

Rules:

- all monetary values stored in pence
- platform fee percent copied onto each sale record
- historical records must not change if the default fee settings change later

## Photo Rules

This area is a major support risk, so V1 should be strict.

Rules:

- default to one photo per item
- convert to WebP
- max dimension 1200px
- compress aggressively
- show photo size warnings before save if needed

Do not promise:

- unlimited photos
- original full-resolution photo retention
- automatic cloud backup

## Backup and Restore

V1 must include manual backup and restore, but it should stay simple.

Recommended approach:

- export structured JSON for database records
- export photos in a separate bundle if needed
- restore should validate schema version before import

Why this approach:

- easier to debug
- lower memory risk than a giant base64-heavy single file
- clearer support process when imports fail

## Offline Behavior

Works offline:

- viewing inventory
- adding and editing items
- marking items as sold
- viewing dashboard and statistics
- logging expenditures
- exporting CSV
- creating local backups

Requires internet:

- first activation
- reactivation after browser storage is cleared
- optional error reporting

## Core Screens

### `/activate`

Purpose:

- redeem activation code

Must have:

- short explanation
- code input
- submit button
- clear error states
- support link

### `/dashboard`

Purpose:

- immediate business summary

Must have:

- current inventory count
- total spent
- total revenue
- total profit
- recent items
- monthly summary snapshot

### `/add-item`

Purpose:

- fast entry while sourcing inventory

Must have:

- title
- purchase price
- purchase date
- platform
- condition
- optional photo
- notes

### `/inventory`

Purpose:

- browse and manage current stock

Must have:

- search
- status filter
- platform filter
- quick mark as sold

### `mark as sold`

Purpose:

- finish the profit workflow quickly

Must have:

- sale price
- sale date
- platform
- postage cost
- fee preview
- resulting profit preview

### `/expenditures`

Purpose:

- log operating costs

Must have:

- add expense
- list expenses
- category filter

### `/statistics`

Purpose:

- basic trend visibility

Must have:

- monthly profit
- monthly revenue
- platform breakdown

### `/tax-summary`

Purpose:

- record summary for bookkeeping

Must have:

- date range
- totals for revenue, costs, and profit
- CSV export

Note:

- avoid implying tax advice

### `/settings`

Purpose:

- adjust defaults and manage data safety

Must have:

- fee settings
- backup/export actions
- restore flow
- storage backend info
- support info

## Explicit V1 Tradeoffs

- no sync means lower complexity and fewer account issues
- manual support for license exceptions is acceptable at this stage
- strict photo limits are better than promising too much
- offline-first matters more than fancy onboarding
- reliability matters more than clever licensing

## Build Order

1. App shell, routing, state, styles
2. Activation screen and minimal activation endpoint contract
3. Local database layer with fallback detection
4. Item create/list/edit flows
5. Mark as sold flow and profit logic
6. Expenditures
7. Dashboard and statistics
8. Backup/restore and CSV export
9. Tests and error monitoring
10. Polish onboarding copy and Etsy PDF handoff

## Definition of Done for V1

V1 is ready when:

- a buyer can follow the PDF and activate without assistance
- a user can add inventory and sell an item from their phone
- profit calculations are correct and tested
- backup and restore work on real devices
- the app works on at least one recent iPhone and one recent Android device
- support burden is low enough that each sale remains worth it
