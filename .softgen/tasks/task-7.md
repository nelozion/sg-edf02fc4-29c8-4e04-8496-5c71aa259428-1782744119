---
title: API Routes & Cron Jobs
status: done
priority: high
type: feature
tags: [api, cron, ebay, cj]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 7
---

## Notes
Create all API routes for eBay OAuth, listing creation, and cron jobs. Build service modules for eBay and CJ API communication.

## Checklist
- [x] Create ebayService.ts with OAuth, token refresh, inventory, offer, order, and tracking methods
- [x] Create cjService.ts with auth, product discovery, order placement, and status tracking
- [x] Create /api/ebay/auth/start (redirect to eBay OAuth)
- [x] Create /api/ebay/auth/callback (exchange code for tokens)
- [x] Create /api/ebay/create-listing (inventory + offer + publish flow)
- [x] Create /api/cron/discover-products (CJ trending products with blacklist filtering)
- [x] Create /api/cron/sync-orders (poll eBay, place CJ orders, update tracking)
- [x] Create /api/cron/sync-inventory (sync prices from CJ to eBay)

## Acceptance
- All cron endpoints callable and log their actions
- eBay token refresh works
- CJ auth flow completes