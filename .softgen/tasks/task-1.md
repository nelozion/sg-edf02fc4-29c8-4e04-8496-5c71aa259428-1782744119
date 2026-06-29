---
title: Database Schema & RLS Setup
status: done
priority: urgent
type: chore
tags: [database, schema, supabase]
created_by: agent
created_at: 2026-06-29T12:19:32Z
position: 1
---

## Notes
Set up all Supabase tables with proper columns, constraints, and RLS policies. Single-user app so RLS will allow authenticated access to all rows.

## Checklist
- [x] Create ebay_tokens table (access_token, refresh_token, expires_at, updated_at)
- [x] Create cj_credentials table (api_key, access_token, expires_at)
- [x] Create settings table (default_margin_percent, sync_interval_minutes, category_blacklist, brand_keyword_blacklist)
- [x] Create product_queue table (cj_product_id, title, image_url, supplier_price, suggested_ebay_price, category, status, created_at)
- [x] Create listings table (cj_product_id, ebay_sku, ebay_offer_id, current_price, current_quantity, last_synced_at)
- [x] Create orders table (ebay_order_id, cj_order_id, status, tracking_number, carrier_code, created_at)
- [x] Create activity_log table (message, level, created_at)
- [x] Enable RLS on all tables with authenticated user policies

## Acceptance
- All 7 tables exist in Supabase with correct columns
- RLS enabled and authenticated users can access all data
- No schema errors in build/typegen