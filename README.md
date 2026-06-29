# Dropship Auto-Pilot

A full-stack Next.js application that automates dropshipping fulfillment between eBay and CJ Dropshipping.

## Features

- **Product Discovery**: Automatically pulls trending products from CJ Dropshipping
- **Approval Workflow**: Review and approve products before listing on eBay
- **Auto-Fulfillment**: Automatically places orders with CJ when eBay sales occur
- **Inventory Sync**: Keeps prices and stock levels synchronized
- **Tracking Updates**: Automatically pushes tracking numbers to eBay orders
- **Activity Dashboard**: Monitor all automation actions in real-time

## Setup

### 1. Environment Variables

Copy `.env.local` and configure:

```env
# Application
NEXT_PUBLIC_APP_LOGIN_PASSWORD=your_password
APP_LOGIN_PASSWORD=your_password

# eBay API
EBAY_CLIENT_ID=your_ebay_client_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
EBAY_REDIRECT_URI=https://yourdomain.com/api/ebay/auth/callback
EBAY_ENV=sandbox  # or production

# Cron Jobs
CRON_SECRET=generate_random_secret_here
```

### 2. eBay Developer Account

1. Create an account at [developer.ebay.com](https://developer.ebay.com)
2. Create an application in the Developer Portal
3. Get your Client ID and Client Secret
4. Set the redirect URI to match your deployment URL + `/api/ebay/auth/callback`
5. Request production access once ready

### 3. CJ Dropshipping Account

1. Sign up at [cjdropshipping.com](https://cjdropshipping.com)
2. Go to My CJ → Authorization → Stores → API
3. Generate an API key
4. Paste it in the Connect page after deploying

### 4. Deploy to Vercel

```bash
npm install
npm run build
```

Then deploy to Vercel. The cron jobs will run automatically:
- **Product Discovery**: Daily at midnight
- **Order Sync**: Every 10 minutes
- **Inventory Sync**: Every 10 minutes

### 5. Connect Accounts

1. Log in with your password
2. Go to Connect page
3. Connect eBay account via OAuth
4. Paste CJ Dropshipping API key

## Database Schema

The app uses Supabase with the following tables:

- `ebay_tokens` - eBay OAuth tokens
- `cj_credentials` - CJ Dropshipping API credentials
- `settings` - Automation configuration
- `product_queue` - Products pending approval
- `listings` - Active eBay listings
- `orders` - Order fulfillment tracking
- `activity_log` - System activity feed

## API Routes

### Authentication
- `POST /api/auth/login` - Password login

### eBay Integration
- `GET /api/ebay/auth/start` - Start OAuth flow
- `GET /api/ebay/auth/callback` - OAuth callback
- `POST /api/ebay/create-listing` - Create eBay listing from queue

### Cron Jobs
- `POST /api/cron/discover-products` - Daily product discovery
- `POST /api/cron/sync-orders` - Order fulfillment sync
- `POST /api/cron/sync-inventory` - Price/stock sync

All cron endpoints require `CRON_SECRET` header or `x-vercel-cron-secret` from Vercel.

## Usage Flow

1. **Discovery**: Cron job pulls trending CJ products daily
2. **Review**: Check Queue page, approve or reject products
3. **Listing**: Approved products auto-create eBay listings
4. **Orders**: When eBay order arrives, cron job places matching CJ order
5. **Tracking**: Once CJ ships, tracking number pushes to eBay
6. **Sync**: Prices auto-update when CJ changes supplier prices

## Security Notes

- Single-user app (password-protected, not multi-tenant)
- All eBay/CJ API calls use server-side routes
- Cron endpoints protected with secret header
- RLS enabled on all Supabase tables

## Tech Stack

- Next.js 15 (Page Router)
- TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS
- shadcn/ui components
- Vercel Cron Jobs