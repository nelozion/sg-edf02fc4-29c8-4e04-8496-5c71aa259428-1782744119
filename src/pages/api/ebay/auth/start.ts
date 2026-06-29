import type { NextApiRequest, NextApiResponse } from "next";
import { getEbayAuthUrl } from "@/services/ebayService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authUrl = await getEbayAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error("Failed to start eBay auth:", error);
    res.status(500).json({ error: "Failed to start authorization" });
  }
}