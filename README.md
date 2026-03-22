# Reseller Tracker PWA

Inventory, sales & profit tracker for eBay, Vinted & Depop resellers.

## Overview

A one-time-purchase Progressive Web App for UK resellers. Track inventory, log sales, auto-calculate profit after platform fees, and export tax summaries.

## Tech Stack

- **Framework:** Vite 6 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** SQLite (OPFS + IndexedDB fallback)
- **State:** Zustand
- **Charts:** Recharts
- **Routing:** React Router v7
- **License:** Vercel Edge Function + Lemon Squeezy (JWT-signed)
- **Monitoring:** Sentry
- **Testing:** Vitest + Playwright

## Features (V1)

- Inventory tracker with photo capture
- Sales logger with auto net profit calculation
- Platform fee presets (eBay 12.8%, Vinted 5%, Depop 10%)
- Dashboard with charts and platform breakdown
- Monthly statistics and tax year summary
- Expenditures tracking
- CSV export and manual backup/restore
- Fully offline via SQLite + Service Worker
- JWT-signed activation code (1 device per key)

## Documentation

See docs/ folder for the full technical specification.

## License

Proprietary - All rights reserved.
