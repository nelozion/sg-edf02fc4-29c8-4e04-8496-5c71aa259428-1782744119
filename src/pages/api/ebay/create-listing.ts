import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { createInventoryItem, createOffer, publishOffer } from "@/services/ebayService";
import { checkAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!checkAuth(req, res)) return;

  const { productId } = req.body;

  try {
    const { data: product } = await supabase
      .from("product_queue")
      .select("*")
      .eq("id", productId)
      .single();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const sku = `CJ-${product.cj_product_id}`;
    
    await createInventoryItem(sku, product, product.suggested_ebay_price, 1);
    const offerId = await createOffer(sku, product.suggested_ebay_price);
    await publishOffer(offerId);

    await supabase.from("listings").insert({
      cj_product_id: product.cj_product_id,
      ebay_sku: sku,
      ebay_offer_id: offerId,
      current_price: product.suggested_ebay_price,
      current_quantity: 1,
      last_synced_at: new Date().toISOString(),
    });

    await supabase.from("activity_log").insert({
      message: `Created eBay listing for ${product.title} (SKU: ${sku})`,
      level: "info",
    });

    res.status(200).json({ success: true, sku, offerId });
  } catch (error) {
    console.error("Failed to create listing:", error);
    
    await supabase.from("activity_log").insert({
      message: `Failed to create eBay listing: ${error instanceof Error ? error.message : "Unknown error"}`,
      level: "error",
    });

    res.status(500).json({ error: "Failed to create listing" });
  }
}