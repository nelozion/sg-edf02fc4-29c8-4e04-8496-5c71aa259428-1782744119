# Dropship Auto-Pilot

## Vision
Single-user dropshipping automation dashboard that bridges eBay and CJ Dropshipping. Automates product discovery, listing management, order fulfillment, and inventory syncing via scheduled cron jobs.

## Design
Enterprise logistics platform aesthetic — professional, data-dense, operational clarity.

Colors:
- --primary: 218 88% 40% (corporate blue #0F52BA)
- --background: 0 0% 98% (off-white)
- --foreground: 222 47% 11% (dark slate)
- --accent: 218 88% 55% (lighter blue for hovers)
- --muted: 210 40% 96% (light gray backgrounds)
- --success: 142 76% 36% (green for approved/shipped)
- --warning: 38 92% 50% (amber for pending)
- --destructive: 0 84% 60% (red for errors/rejected)

Fonts: Inter (body), JetBrains Mono (SKUs/IDs/tracking)

## Features
1. Product discovery queue with approval workflow
2. eBay listing creation via Inventory API
3. Automated order fulfillment with CJ Dropshipping
4. Price/stock sync on schedule
5. Activity log dashboard
6. eBay OAuth + CJ API key management
7. Configurable margins and blacklists