# Reseller Tracker

Inventory, sales, and profit tracking for eBay, Vinted, and Depop resellers.

## Positioning

This repo is for a lean V1 PWA optimized for:

- fast launch
- offline-first usage
- low support overhead
- Etsy-driven discovery with PDF-based onboarding

The product is intentionally narrow. It is not trying to solve sync, collaboration, or complex licensing in V1.

## Planned Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router
- Zustand
- SQLite with browser-compatible fallback
- Minimal activation endpoint

## Lean V1 Features

- activation screen
- inventory tracking
- mark as sold flow with profit calculation
- expenditures tracking
- dashboard and monthly statistics
- tax summary
- CSV export
- manual backup and restore
- constrained photo support

## Documentation

Primary working spec:

- `docs/ResellTracker_V1_Lean_Spec.md`

Older drafts are kept in `docs/` for reference only.

## License

Proprietary. All rights reserved.
