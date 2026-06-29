---
title: API Routes & Cron Jobs
status: todo
priority: high
type: feature
tags: [api, cron, automation]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 7
---

## Notes
Build API endpoints for eBay/CJ integrations and Vercel cron jobs for automation.

## Checklist
- [ ] Build /api/cron/discover-products (pulls trending CJ products into queue)
- [ ] Build /api/cron/sync-orders (polls eBay orders, places with CJ, pushes tracking)
- [ ] Build /api/cron/sync-inventory (syncs CJ price/stock to eBay listings)
- [ ] Build /api/ebay/refresh-token (refreshes eBay access token)
- [ ] Build /api/cj/auth (exchanges API key for access token)
- [ ] Add activity log entries for all cron actions

## Acceptance
- Cron endpoints callable and log their actions
- eBay token refresh works
- CJ auth flow completes