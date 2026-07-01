import { supabase } from "@/integrations/supabase/client";

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID!;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET!;
const EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI!;
const EBAY_ENV = process.env.EBAY_ENV || "sandbox";
const EBAY_BASE_URL = EBAY_ENV === "production" 
  ? "https://api.ebay.com" 
  : "https://api.sandbox.ebay.com";
const EBAY_AUTH_URL = EBAY_ENV === "production"
  ? "https://auth.ebay.com"
  : "https://auth.sandbox.ebay.com";

interface EbayTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export async function getEbayAuthUrl(): Promise<string> {
  const scopes = encodeURIComponent("https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.account");
  return `${EBAY_AUTH_URL}/oauth2/authorize?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(EBAY_REDIRECT_URI)}&scope=${scopes}`;
}

export async function exchangeCodeForTokens(code: string): Promise<EbayTokens> {
  const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64");
  console.log("Token exchange attempt:", {
    env: EBAY_ENV,
    authUrl: EBAY_AUTH_URL,
    redirectUri: EBAY_REDIRECT_URI,
    clientIdPrefix: EBAY_CLIENT_ID?.slice(0, 8),
  });
  const response = await fetch(`${EBAY_BASE_URL}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: EBAY_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("eBay token exchange failed:", response.status, errorBody);
    throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorBody}`);
  }
  

  const data = await response.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
  };
}

export async function refreshEbayToken(): Promise<string> {
  const { data: tokenData } = await supabase
    .from("ebay_tokens")
    .select("*")
    .limit(1)
    .single();

  if (!tokenData) throw new Error("No eBay tokens found");

  const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(`${EBAY_BASE_URL}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenData.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh eBay token");
  }

  const data = await response.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await supabase
    .from("ebay_tokens")
    .update({
      access_token: data.access_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenData.id);

  return data.access_token;
}

export async function getValidAccessToken(): Promise<string> {
  const { data: tokenData } = await supabase
    .from("ebay_tokens")
    .select("*")
    .limit(1)
    .single();

  if (!tokenData) throw new Error("No eBay tokens found");

  if (new Date(tokenData.expires_at) <= new Date()) {
    return await refreshEbayToken();
  }

  return tokenData.access_token;
}

export async function createInventoryItem(sku: string, product: any, price: number, quantity: number) {
  const accessToken = await getValidAccessToken();

  const inventoryItem = {
    product: {
      title: product.title,
      description: product.title,
      imageUrls: product.image_url ? [product.image_url] : [],
      aspects: {
        Brand: ["Generic"],
      },
    },
    condition: "NEW",
    availability: {
      shipToLocationAvailability: {
        quantity,
      },
    },
  };

  const response = await fetch(`${EBAY_BASE_URL}/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept-Language": "en-US",
      "Content-Language": "en-US",
    },
    body: JSON.stringify(inventoryItem),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create inventory item: ${error}`);
  }
}
async function getFirstPolicyId(accessToken: string, policyType: string): Promise<string> {
  const response = await fetch(
    `${EBAY_BASE_URL}/sell/account/v1/${policyType}?marketplace_id=EBAY_GB`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept-Language": "en-US",
      },
    }
  );
  if (!response.ok) return "";
  const data = await response.json();
  const key = Object.keys(data).find(k => Array.isArray(data[k]));
  return key ? data[key]?.[0]?.[`${policyType.replace("_policy", "")}PolicyId`] || "" : "";
}
export async function createOffer(sku: string, price: number) {
  const accessToken = await getValidAccessToken();

  const offer = {
    sku,
    marketplaceId: "EBAY_GB",
    format: "FIXED_PRICE",
    availableQuantity: 1,
    pricingSummary: {
      price: {
        value: price.toString(),
        currency: "GBP",
      },
    },
    listingPolicies: {
      fulfillmentPolicyId: await getFirstPolicyId(accessToken, "fulfillment_policy"),
      paymentPolicyId: await getFirstPolicyId(accessToken, "payment_policy"),
      returnPolicyId: await getFirstPolicyId(accessToken, "return_policy"),
    },
  };

  const response = await fetch(`${EBAY_BASE_URL}/sell/inventory/v1/offer`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept-Language": "en-US",
      "Content-Language": "en-US",
    },
    body: JSON.stringify(offer),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create offer: ${error}`);
  }

  const data = await response.json();
  return data.offerId;
}

export async function publishOffer(offerId: string) {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`${EBAY_BASE_URL}/sell/inventory/v1/offer/${offerId}/publish/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to publish offer: ${error}`);
  }
}

export async function getUnfulfilledOrders() {
  const accessToken = await getValidAccessToken();

  const response = await fetch(
    `${EBAY_BASE_URL}/sell/fulfillment/v1/order?filter=orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const data = await response.json();
  return data.orders || [];
}

export async function updateTracking(orderId: string, trackingNumber: string, carrierCode: string) {
  const accessToken = await getValidAccessToken();

  const fulfillment = {
    lineItems: [],
    shippingCarrierCode: carrierCode,
    trackingNumber,
  };

  const response = await fetch(
    `${EBAY_BASE_URL}/sell/fulfillment/v1/order/${orderId}/shipping_fulfillment`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fulfillment),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update tracking");
  }
}

export async function updateInventoryPrice(sku: string, price: number) {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`${EBAY_BASE_URL}/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update inventory");
  }
}

export async function updateOfferPrice(offerId: string, price: number) {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`${EBAY_BASE_URL}/sell/inventory/v1/offer/${offerId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pricingSummary: {
        price: {
          value: price.toString(),
          currency: "GBP",
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update offer price");
  }
}
