import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

interface Order {
  id: string;
  ebay_order_id: string;
  cj_order_id: string;
  status: string;
  tracking_number: string | null;
  carrier_code: string | null;
  created_at: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data ?? []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "shipped") {
      return <Badge className="bg-success text-success-foreground">Shipped</Badge>;
    }
    return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">Placed</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <>
      <SEO title="Orders - Dropship Auto-Pilot" />
      <Layout>
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">Track fulfillment status and shipping</p>
          </div>

          <Card>
            <CardContent className="p-0">
              {orders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No orders yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>eBay Order ID</TableHead>
                      <TableHead>CJ Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking Number</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.ebay_order_id}</TableCell>
                        <TableCell className="font-mono">{order.cj_order_id}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {order.tracking_number || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.carrier_code || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}