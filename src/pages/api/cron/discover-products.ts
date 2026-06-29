import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { getTrendingProducts } from "@/services/cjService";

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
    const categoryBlacklist = settings?.category_blacklist || [];
    const brandBlacklist = settings?.brand_keyword_blacklist || [];

    const products = await getTrendingProducts(1, 20);

    let addedCount = 0;
    let rejectedCount = 0;

    for (const product of products) {
      const isBlacklisted = 
        categoryBlacklist.some((cat: string) => product.categoryName?.toLowerCase().includes(cat.toLowerCase())) ||
        brandBlacklist.some((brand: string) => product.productNameEn?.toLowerCase().includes(brand.toLowerCase()));

      if (isBlacklisted) {
        rejectedCount++;
        await supabase.from("activity_log").insert({
          message: `Auto-rejected blacklisted product: ${product.productNameEn}`,
          level: "info",
        });
        continue;
      }

      const { data: existing } = await supabase
        .from("product_queue")
        .select("id")
        .eq("cj_product_id", product.pid)
        .single();

      if (existing) continue;

      const supplierPrice = parseFloat(product.sellPrice || "0");
      const suggestedPrice = supplierPrice * (1 + margin / 100);

      await supabase.from("product_queue").insert({
        cj_product_id: product.pid,
        title: product.productNameEn,
        image_url: product.productImage,
        supplier_price: supplierPrice,
        suggested_ebay_price: suggestedPrice,
        category: product.categoryName,
        status: "pending",
      });

      addedCount++;
    }

    await supabase.from("activity_log").insert({
      message: `Product discovery: ${addedCount} added, ${rejectedCount} auto-rejected`,
      level: "info",
    });

    res.status(200).json({ success: true, added: addedCount, rejected: rejectedCount });
  } catch (error) {
    console.error("Product discovery failed:", error);
    
    await supabase.from("activity_log").insert({
      message: `Product discovery failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      level: "error",
    });

    res.status(500).json({ error: "Product discovery failed" });
  }
}