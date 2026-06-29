---
title: Product Queue & Approval Workflow
status: done
priority: high
type: feature
tags: [queue, products, approval]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 4
---

## Notes
Build /queue page showing product_queue rows with status=pending. Approve triggers eBay listing creation, reject updates status.

## Checklist
- [x] Create /queue page with product cards
- [x] Fetch products with status=pending from product_queue
- [x] Display product image, title, prices, category
- [x] Approve button that updates status and calls /api/ebay/create-listing
- [x] Reject button that updates status to rejected
- [x] Show success/error toasts

## Acceptance
- Queue page shows pending products
- Approve creates live eBay listing
- Reject marks product as rejected