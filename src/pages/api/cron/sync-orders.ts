import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { getUnfulfilledOrders, updateTracking } from "@/services/ebayService";
import { createCjOrder, getCjOrderStatus } from "@/services/cjService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = req.headers["x-vercel-cron-secret"] || req.headers.authorization?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const ebayOrders = await getUnfulfilledOrders();
    let newOrdersCount = 0;
    let updatedCount = 0;

    for (const order of ebayOrders) {
      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("ebay_order_id", order.orderId)
        .single();

      if (!existing) {
        const shippingAddress = order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo;
        
        if (!shippingAddress) continue;

        const cjOrderId = await createCjOrder({
          products: order.lineItems.map((item: any) => ({
            productId: item.sku.replace("CJ-", ""),
            quantity: item.quantity,
          })),
          shippingAddress: {
            firstName: shippingAddress.fullName?.split(" ")[0] || "",
            lastName: shippingAddress.fullName?.split(" ").slice(1).join(" ") || "",
            address1: shippingAddress.contactAddress?.addressLine1 || "",
            city: shippingAddress.contactAddress?.city || "",
            state: shippingAddress.contactAddress?.stateOrProvince || "",
            zip: shippingAddress.contactAddress?.postalCode || "",
            country: shippingAddress.contactAddress?.countryCode || "US",
            phone: shippingAddress.primaryPhone?.phoneNumber || "",
          },
        });

        await supabase.from("orders").insert({
          ebay_order_id: order.orderId,
          cj_order_id: cjOrderId,
          status: "placed",
          tracking_number: null,
          carrier_code: null,
        });

        await supabase.from("activity_log").insert({
          message: `New order placed with CJ: ${order.orderId}`,
          level: "info",
        });

        newOrdersCount++;
      } else if (existing.status === "placed") {
        const cjStatus = await getCjOrderStatus(existing.cj_order_id);
        
        if (cjStatus.trackingNumber) {
          await updateTracking(
            existing.ebay_order_id,
            cjStatus.trackingNumber,
            cjStatus.carrierCode || "OTHER"
          );

          await supabase
            .from("orders")
            .update({
              status: "shipped",
              tracking_number: cjStatus.trackingNumber,
              carrier_code: cjStatus.carrierCode,
            })
            .eq("id", existing.id);

          await supabase.from("activity_log").insert({
            message: `Tracking updated for order ${existing.ebay_order_id}: ${cjStatus.trackingNumber}`,
            level: "info",
          });

          updatedCount++;
        }
      }
    }

    res.status(200).json({ success: true, newOrders: newOrdersCount, updated: updatedCount });
  } catch (error) {
    console.error("Order sync failed:", error);
    
    await supabase.from("activity_log").insert({
      message: `Order sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      level: "error",
    });

    res.status(500).json({ error: "Order sync failed" });
  }
}