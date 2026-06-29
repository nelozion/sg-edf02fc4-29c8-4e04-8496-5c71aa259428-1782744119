import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

interface Listing {
  id: string;
  cj_product_id: string;
  ebay_sku: string;
  ebay_offer_id: string;
  current_price: number;
  current_quantity: number;
  last_synced_at: string;
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadListings();
  }, [router]);

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("last_synced_at", { ascending: false });

      if (error) throw error;
      setListings(data ?? []);
    } catch (error) {
      console.error("Failed to load listings:", error);
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
      <SEO title="Listings - Dropship Auto-Pilot" />
      <Layout>
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Active Listings</h1>
            <p className="text-muted-foreground mt-1">All products currently listed on eBay</p>
          </div>

          <Card>
            <CardContent className="p-0">
              {listings.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No active listings yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>eBay SKU</TableHead>
                      <TableHead>CJ Product ID</TableHead>
                      <TableHead>Offer ID</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Last Synced</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-mono font-medium">{listing.ebay_sku}</TableCell>
                        <TableCell className="font-mono">{listing.cj_product_id}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{listing.ebay_offer_id}</TableCell>
                        <TableCell className="text-right font-mono">${listing.current_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{listing.current_quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(listing.last_synced_at).toLocaleString()}
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