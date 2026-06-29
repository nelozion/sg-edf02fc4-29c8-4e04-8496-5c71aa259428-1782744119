---
title: Product Queue & Approval Workflow
status: todo
priority: high
type: feature
tags: [queue, products, approval]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 4
---

## Notes
Display pending products from product_queue table with approve/reject actions. Approval creates eBay listing via Inventory API.

## Checklist
- [ ] Create /queue page with table of pending products
- [ ] Show product image, title, supplier price, suggested eBay price
- [ ] Add Approve/Reject buttons for each product
- [ ] Build /api/products/approve endpoint that creates eBay listing (inventory item + offer + publish)
- [ ] Build /api/products/reject endpoint that updates status to rejected
- [ ] Filter out blacklisted categories/brands (auto-reject, add to activity log)

## Acceptance
- Queue page shows pending products
- Approve creates live eBay listing
- Reject marks product as rejected