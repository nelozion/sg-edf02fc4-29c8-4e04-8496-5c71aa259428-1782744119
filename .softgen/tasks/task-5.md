---
title: Listings & Orders Pages
status: done
priority: medium
type: feature
tags: [listings, orders, tables]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 5
---

## Notes
Build /listings and /orders pages with tables showing current inventory and fulfillment status.

## Checklist
- [x] Create /listings page with table
- [x] Show ebay_sku, cj_product_id, price, quantity, last_synced_at
- [x] Create /orders page with table
- [x] Show order IDs, status badges (placed/shipped), tracking numbers
- [x] Use JetBrains Mono font for SKUs/IDs/tracking

## Acceptance
- Listings page shows all active listings
- Orders page shows all orders with fulfillment status
- Status badges use green/yellow/red based on state