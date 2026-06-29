import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Package, ShoppingCart, ClipboardList, Activity } from "lucide-react";

interface ActivityLog {
  id: string;
  message: string;
  level: string;
  created_at: string;
}

interface Stats {
  pendingApprovals: number;
  activeListings: number;
  ordersAwaiting: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats>({ pendingApprovals: 0, activeListings: 0, ordersAwaiting: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [logRes, queueRes, listingsRes, ordersRes] = await Promise.all([
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("product_queue").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("listings").select("id", { count: "exact" }),
        supabase.from("orders").select("id", { count: "exact" }).eq("status", "placed"),
      ]);

      setActivityLog(logRes.data ?? []);
      setStats({
        pendingApprovals: queueRes.count ?? 0,
        activeListings: listingsRes.count ?? 0,
        ordersAwaiting: ordersRes.count ?? 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
      <SEO title="Dashboard - Dropship Auto-Pilot" />
      <Layout>
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your dropshipping automation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeListings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Orders Awaiting Shipment</CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ordersAwaiting}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <CardTitle>Activity Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {activityLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                      <Badge variant={log.level === "error" ? "destructive" : "secondary"} className="mt-0.5">
                        {log.level}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <p className="text-foreground">{log.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}