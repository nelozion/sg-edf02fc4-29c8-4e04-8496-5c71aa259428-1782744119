import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { getProductDetail } from "@/services/cjService";
import { updateOfferPrice } from "@/services/ebayService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = req.headers["x-vercel-cron-secret"] || req.headers.authorization?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    const margin = settings?.default_margin_percent || 30;

    const { data: listings } = await supabase
      .from("listings")
      .select("*");

    let updatedCount = 0;

    for (const listing of listings || []) {
      try {
        const productDetail = await getProductDetail(listing.cj_product_id);
        const newSupplierPrice = parseFloat(productDetail.sellPrice || "0");
        const newEbayPrice = newSupplierPrice * (1 + margin / 100);

        if (Math.abs(newEbayPrice - listing.current_price) > 0.01) {
          await updateOfferPrice(listing.ebay_offer_id, newEbayPrice);

          await supabase
            .from("listings")
            .update({
              current_price: newEbayPrice,
              last_synced_at: new Date().toISOString(),
            })
            .eq("id", listing.id);

          await supabase.from("activity_log").insert({
            message: `Price updated for SKU ${listing.ebay_sku}: $${listing.current_price.toFixed(2)} → $${newEbayPrice.toFixed(2)}`,
            level: "info",
          });

          updatedCount++;
        } else {
          await supabase
            .from("listings")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", listing.id);
        }
      } catch (error) {
        console.error(`Failed to sync ${listing.ebay_sku}:`, error);
        
        await supabase.from("activity_log").insert({
          message: `Failed to sync SKU ${listing.ebay_sku}: ${error instanceof Error ? error.message : "Unknown error"}`,
          level: "error",
        });
      }
    }

    res.status(200).json({ success: true, updated: updatedCount });
  } catch (error) {
    console.error("Inventory sync failed:", error);
    
    await supabase.from("activity_log").insert({
      message: `Inventory sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      level: "error",
    });

    res.status(500).json({ error: "Inventory sync failed" });
  }
}