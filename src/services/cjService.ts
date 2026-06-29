import { supabase } from "@/integrations/supabase/client";

const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

interface CjCredentials {
  id: string;
  api_key: string;
  access_token: string;
  expires_at: string;
}

export async function getCjAccessToken(): Promise<string> {
  const { data: creds } = await supabase
    .from("cj_credentials")
    .select("*")
    .limit(1)
    .single();

  if (!creds) throw new Error("No CJ credentials found");

  if (new Date(creds.expires_at) <= new Date()) {
    return await refreshCjToken(creds);
  }

  return creds.access_token;
}

async function refreshCjToken(creds: CjCredentials): Promise<string> {
  const response = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey: creds.api_key,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh CJ access token");
  }

  const data = await response.json();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("cj_credentials")
    .update({
      access_token: data.data.accessToken,
      expires_at: expiresAt,
    })
    .eq("id", creds.id);

  return data.data.accessToken;
}

export async function getTrendingProducts(page: number = 1, pageSize: number = 20) {
  const accessToken = await getCjAccessToken();

  const response = await fetch(`${CJ_API_BASE}/product/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": accessToken,
    },
    body: JSON.stringify({
      pageNum: page,
      pageSize,
      productType: 1,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch trending products");
  }

  const data = await response.json();
  return data.data?.list || [];
}

export async function getProductDetail(productId: string) {
  const accessToken = await getCjAccessToken();

  const response = await fetch(`${CJ_API_BASE}/product/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": accessToken,
    },
    body: JSON.stringify({
      pid: productId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product detail");
  }

  const data = await response.json();
  return data.data;
}

export async function createCjOrder(orderData: {
  products: Array<{ productId: string; quantity: number }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
}) {
  const accessToken = await getCjAccessToken();

  const response = await fetch(`${CJ_API_BASE}/shopping/order/createOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": accessToken,
    },
    body: JSON.stringify({
      products: orderData.products.map(p => ({
        vid: p.productId,
        quantity: p.quantity,
      })),
      shippingAddress: orderData.shippingAddress,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create CJ order");
  }

  const data = await response.json();
  return data.data?.orderId;
}

export async function getCjOrderStatus(orderId: string) {
  const accessToken = await getCjAccessToken();

  const response = await fetch(`${CJ_API_BASE}/shopping/order/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": accessToken,
    },
    body: JSON.stringify({
      orderId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch order status");
  }

  const data = await response.json();
  return data.data;
}