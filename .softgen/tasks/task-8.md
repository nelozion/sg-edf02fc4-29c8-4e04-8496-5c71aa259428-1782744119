---
title: Vercel Cron Configuration
status: done
priority: low
type: chore
tags: [vercel, deployment]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 8
---

## Notes
Configure Vercel cron jobs in vercel.json for automated product discovery, order sync, and inventory sync.

## Checklist
- [x] Create vercel.json with cron schedules
- [x] Daily product discovery (0 0 * * *)
- [x] Every 10 minutes order sync (*/10 * * * *)
- [x] Every 10 minutes inventory sync (*/10 * * * *)
- [x] Add CRON_SECRET verification to all cron endpoints

## Acceptance
- vercel.json has all three cron jobs configured
- Cron endpoints protected with CRON_SECRET verification