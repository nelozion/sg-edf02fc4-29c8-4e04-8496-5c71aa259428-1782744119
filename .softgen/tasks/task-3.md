---
title: Connect Page - eBay OAuth & CJ Setup
status: todo
priority: high
type: feature
tags: [oauth, ebay, cj-dropshipping]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 3
---

## Notes
Page to connect eBay account via OAuth and save CJ API key. Stores credentials in Supabase tables.

## Checklist
- [ ] Create /connect page showing eBay connection status
- [ ] Add "Connect eBay" button that starts OAuth flow
- [ ] Build /api/auth/ebay/authorize endpoint (redirects to eBay OAuth)
- [ ] Build /api/auth/ebay/callback endpoint (exchanges code for tokens, saves to ebay_tokens)
- [ ] Add CJ API key form that saves to cj_credentials table
- [ ] Display current connection status for both integrations

## Acceptance
- Can click "Connect eBay" and complete OAuth flow
- eBay tokens saved to database
- Can paste CJ API key and see it persisted