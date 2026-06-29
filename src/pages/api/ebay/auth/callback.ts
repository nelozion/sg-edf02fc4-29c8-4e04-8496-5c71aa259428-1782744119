import type { NextApiRequest, NextApiResponse } from "next";
import { exchangeCodeForTokens } from "@/services/ebayService";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    const { error } = await supabase.from("ebay_tokens").upsert({
      id: "00000000-0000-0000-0000-000000000001",
      ...tokens,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    await supabase.from("activity_log").insert({
      message: "eBay account connected successfully",
      level: "info",
    });

    res.redirect("/connect?success=true");
  } catch (error) {
    console.error("Failed to complete eBay auth:", error);
    
    await supabase.from("activity_log").insert({
      message: `eBay connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      level: "error",
    });

    res.redirect("/connect?error=auth_failed");
  }
}