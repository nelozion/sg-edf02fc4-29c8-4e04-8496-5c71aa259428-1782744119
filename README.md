# Dropship Auto-Pilot 🚀

**Automated dropshipping fulfillment between eBay and CJ Dropshipping**

This app runs on autopilot after initial setup — it discovers trending products, lets you approve them, creates eBay listings, fulfills orders automatically, and keeps prices/stock in sync.

---

## 📋 What This App Does

1. **Product Discovery (Daily)** — Pulls trending products from CJ Dropshipping into a review queue
2. **Manual Approval** — You review and approve/reject products before they go live
3. **Auto-Listing** — Approved products become live eBay listings automatically
4. **Order Fulfillment (Every 10min)** — Monitors eBay for new orders, places them with CJ, updates tracking
5. **Price/Stock Sync (Every 10min)** — Keeps eBay listings updated with CJ's latest prices and inventory

---

## 🚀 Step-by-Step Setup Guide

### **Step 1: Deploy to Vercel**

1. **Fork or clone this repository** to your GitHub account
2. **Go to [Vercel](https://vercel.com)** and sign in
3. **Click "New Project"** and import your repository
4. **Don't deploy yet** — you need to add environment variables first

### **Step 2: Get Your eBay API Credentials**

1. Go to [eBay Developer Program](https://developer.ebay.com/)
2. Sign in and create an account if you don't have one
3. Go to **"Application Keys"** → **"Get Your Application Keys"**
4. Create a new app (name it anything, e.g., "Dropship Auto-Pilot")
5. **For Sandbox Testing** (recommended first):
   - Copy your **Sandbox App ID (Client ID)**
   - Copy your **Sandbox Cert ID (Client Secret)**
   - Set your **Sandbox Redirect URI** to: `https://YOUR-VERCEL-URL.vercel.app/api/ebay/auth/callback`
6. **For Production** (after testing works):
   - Copy your **Production App ID (Client ID)**
   - Copy your **Production Cert ID (Client Secret)**
   - Set your **Production Redirect URI** to: `https://YOUR-VERCEL-URL.vercel.app/api/ebay/auth/callback`

### **Step 3: Get Your CJ Dropshipping API Key**

1. Go to [CJ Dropshipping](https://cjdropshipping.com/) and sign in
2. Navigate to **My CJ** → **Authorization** → **Stores**
3. Click **"API"** tab
4. Click **"Create API Key"** or copy your existing one
5. Save this key — you'll paste it into the app later

### **Step 4: Configure Environment Variables in Vercel**

In your Vercel project settings, go to **Settings** → **Environment Variables** and add these:

**Required Variables:**

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_APP_LOGIN_PASSWORD` | Your dashboard password | `mySecurePassword123` |
| `APP_LOGIN_PASSWORD` | Same as above (server-side) | `mySecurePassword123` |
| `EBAY_CLIENT_ID` | eBay App ID from Step 2 | `YourAppI-YourApp-PRD-...` |
| `EBAY_CLIENT_SECRET` | eBay Cert ID from Step 2 | `PRD-abc123def456...` |
| `EBAY_REDIRECT_URI` | Must match redirect URI in eBay dev portal | `https://your-app.vercel.app/api/ebay/auth/callback` |
| `EBAY_SCOPES` | Required permissions | `https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.account` |
| `EBAY_ENV` | Use sandbox first, then production | `sandbox` or `production` |
| `CRON_SECRET` | Random secret for cron job security | `randomSecretString123` |

**Auto-populated (from Supabase integration):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Step 5: Deploy**

1. Click **"Deploy"** in Vercel
2. Wait for deployment to complete
3. Visit your app at `https://your-app.vercel.app`

---

## 🎯 First-Time Configuration

### **1. Login**

- Visit your deployed app
- Enter the password you set in `NEXT_PUBLIC_APP_LOGIN_PASSWORD`
- You'll be redirected to the Dashboard

### **2. Connect eBay Account**

1. Click **"Connect"** in the sidebar
2. Under eBay section, click **"Connect eBay Account"**
3. You'll be redirected to eBay's authorization page
4. **Sign in with your eBay SELLER account** (the one you want to list products on)
5. Click **"Agree"** to grant permissions
6. You'll be redirected back to the app
7. You should see a green **"Connected"** badge

### **3. Connect CJ Dropshipping**

1. Still on the Connect page, scroll to CJ Dropshipping section
2. Paste your API key from Step 3
3. Click **"Save CJ API Key"**
4. You should see a green **"Connected"** badge

### **4. Configure Settings**

1. Click **"Settings"** in the sidebar
2. Set your **Default Margin Percentage** (e.g., `30` for 30% profit)
   - If CJ sells a product for $10, your eBay price will be $13
3. **Sync Interval** is set to 10 minutes by default (matches cron schedule)
4. **Category Blacklist** (optional) — Enter categories to avoid (one per line):
   ```
   Nike
   Adidas
   Apple
   ```
5. **Brand Keyword Blacklist** (optional) — Enter brand keywords to filter out:
   ```
   Supreme
   Gucci
   Louis Vuitton
   ```
6. Click **"Save Settings"**

---

## 📊 Daily Workflow

### **How It Works After Setup:**

**Automated (no action needed):**

1. **Every day at midnight**: The app discovers trending products from CJ and adds them to your Queue
   - Products matching your blacklists are auto-rejected
2. **Every 10 minutes**: The app checks for new eBay orders and fulfills them via CJ
3. **Every 10 minutes**: The app syncs prices and stock from CJ to eBay

**Your job:**

1. **Review the Queue** (click "Queue" in sidebar)
   - See new trending products waiting for approval
   - Each shows: product image, title, CJ price, suggested eBay price
2. **Approve or Reject**
   - Click **"Approve"** → Creates a live eBay listing instantly
   - Click **"Reject"** → Removes from queue
3. **Monitor Activity**
   - Dashboard shows recent automation activity
   - Check "Listings" to see what's live on eBay
   - Check "Orders" to see fulfillment status

---

## 🔍 Understanding Each Page

### **Dashboard**
- Activity feed (most recent automation actions)
- Metrics: pending approvals, active listings, orders awaiting shipment

### **Connect**
- eBay connection status
- CJ Dropshipping connection status
- Reconnect buttons if tokens expire

### **Queue**
- Products discovered by automation, waiting for your approval
- Only shows "pending" items
- Approve → Creates eBay listing
- Reject → Marks as rejected

### **Listings**
- All products currently listed on your eBay store
- Shows eBay SKU, CJ Product ID, price, quantity, last sync time
- Uses monospaced font for technical IDs

### **Orders**
- All orders from eBay, their fulfillment status with CJ
- Status badges:
  - 🟡 Yellow "placed" = order sent to CJ, awaiting shipment
  - 🟢 Green "shipped" = tracking number received and pushed to eBay
- Tracking numbers shown in monospaced font

### **Settings**
- Default margin percentage for pricing
- Sync interval (should match cron schedule)
- Category and brand blacklists

---

## 🔧 Troubleshooting

### **"Not Connected" on Connect page**

- **eBay**: Click "Connect eBay Account" and complete OAuth flow
- **CJ**: Check that your API key is valid and hasn't expired

### **No products appearing in Queue**

- Wait until midnight (cron runs daily)
- Or manually trigger: Visit `/api/cron/discover-products?secret=YOUR_CRON_SECRET`
- Check Activity log for errors

### **eBay listing creation fails**

- Check that your eBay account has seller status
- Verify you're using the correct environment (sandbox vs production)
- Check Activity log for specific error messages

### **Orders not fulfilling automatically**

- Ensure eBay and CJ are both connected
- Check that sync-orders cron is running (every 10 min)
- Manually trigger: Visit `/api/cron/sync-orders?secret=YOUR_CRON_SECRET`

### **Prices/stock not syncing**

- Manually trigger: Visit `/api/cron/sync-inventory?secret=YOUR_CRON_SECRET`
- Check Activity log for API errors

---

## 🛡️ Security Notes

- **Single-user app**: Only one password, stored in environment variables
- **CRON_SECRET**: Protects cron endpoints from unauthorized access
- **eBay tokens**: Stored securely in Supabase, refreshed automatically
- **CJ API key**: Encrypted in database, only decrypted server-side

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (with Cron Jobs)
- **APIs**: eBay Inventory API, CJ Dropshipping API v2

---

## 📚 Additional Resources

- [eBay Inventory API Docs](https://developer.ebay.com/api-docs/sell/inventory/overview.html)
- [CJ Dropshipping API Docs](https://developers.cjdropshipping.com/api2.0/v1/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🚨 Important Legal Notes

1. **Trademark Compliance**: Use category and brand blacklists to avoid listing products from brands that don't allow reselling
2. **eBay Policies**: Review [eBay's Dropshipping Policy](https://www.ebay.com/help/selling/listings/setting-up-listings/drop-shipping?id=4176)
3. **Tax Obligations**: Consult a tax professional about sales tax and income reporting
4. **Product Liability**: You're responsible for product quality and customer service

---

## 📞 Support

For issues with:
- **eBay API**: Contact [eBay Developer Support](https://developer.ebay.com/support)
- **CJ Dropshipping**: Contact CJ support team
- **Vercel Deployment**: Check [Vercel Documentation](https://vercel.com/docs)

---

**Happy Dropshipping! 🎉**