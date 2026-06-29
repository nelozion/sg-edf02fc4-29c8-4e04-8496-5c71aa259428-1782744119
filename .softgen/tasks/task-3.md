---
title: Connect Page - eBay OAuth & CJ Setup
status: done
priority: high
type: feature
tags: [ebay, cj, oauth]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 3
---

## Notes
Build the /connect page with eBay OAuth flow starter and CJ API key form. Shows connection status badges.

## Checklist
- [x] Create /connect page with Layout
- [x] Check ebay_tokens and cj_credentials tables for connection status
- [x] Show connection status badges (connected/not connected)
- [x] "Connect eBay Account" button that redirects to /api/ebay/auth/start
- [x] CJ API key input field with save button
- [x] Save CJ API key to cj_credentials table

## Acceptance
- Connect page shows connection status for both services
- Can start complete OAuth flow
- eBay tokens saved to database
- Can paste CJ API key and see it persisted