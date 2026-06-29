---
title: Auth System & Design Foundation
status: done
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
- [x] Update globals.css with blue corporate theme and Inter/JetBrains Mono fonts
- [x] Sync tokens to tailwind.config.ts
- [x] Create auth middleware to check password session
- [x] Build login page with password form
- [x] Create main layout component with sidebar nav (Dashboard, Connect, Queue, Listings, Orders, Settings)
- [x] Update index.tsx to redirect to /dashboard when logged in

## Acceptance
- Login page works with APP_LOGIN_PASSWORD env var
- Sidebar nav visible on all protected pages
- Design system tokens applied consistently