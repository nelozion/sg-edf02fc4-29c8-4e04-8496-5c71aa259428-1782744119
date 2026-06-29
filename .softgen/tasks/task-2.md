---
title: Auth System & Design Foundation
status: todo
priority: urgent
type: feature
tags: [auth, design-system, layout]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 2
---

## Notes
Single-user password auth (no Supabase Auth, just env var password check). Set up design tokens, fonts, and main layout with sidebar nav.

## Checklist
- [ ] Update globals.css with blue corporate theme and Inter/JetBrains Mono fonts
- [ ] Sync tokens to tailwind.config.ts
- [ ] Create auth middleware to check password session
- [ ] Build login page with password form
- [ ] Create main layout component with sidebar nav (Dashboard, Connect, Queue, Listings, Orders, Settings)
- [ ] Update index.tsx to redirect to /dashboard when logged in

## Acceptance
- Login page works with APP_LOGIN_PASSWORD env var
- Sidebar nav visible on all protected pages
- Design system tokens applied consistently