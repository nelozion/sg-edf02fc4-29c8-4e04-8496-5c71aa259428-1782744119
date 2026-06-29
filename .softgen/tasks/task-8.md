---
title: Vercel Cron Configuration
status: todo
priority: low
type: chore
tags: [vercel, cron, deployment]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 8
---

## Notes
Configure Vercel cron jobs in vercel.json for scheduled automation.

## Checklist
- [ ] Update vercel.json with cron schedule for /api/cron/discover-products (daily)
- [ ] Add cron schedule for /api/cron/sync-orders (every 10 minutes)
- [ ] Add cron schedule for /api/cron/sync-inventory (every 10 minutes)

## Acceptance
- vercel.json has all three cron jobs configured
- Cron endpoints protected with CRON_SECRET verification