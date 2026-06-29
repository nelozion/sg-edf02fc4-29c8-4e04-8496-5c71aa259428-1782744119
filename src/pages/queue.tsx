import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  cj_product_id: string;
  title: string;
  image_url: string;
  supplier_price: number;
  suggested_ebay_price: number;
  category: string;
  status: string;
  created_at: string;
}

export default function QueuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadProducts();
  }, [router]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("product_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data ?? []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("product_queue")
        .update({ status: "approved" })
        .eq("id", productId);

      if (error) throw error;

      await fetch("/api/ebay/create-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      toast({
        title: "Success",
        description: "Product approved and eBay listing created",
      });

      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Failed to approve product:", error);
      toast({
        title: "Error",
        description: "Failed to approve product",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("product_queue")
        .update({ status: "rejected" })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product rejected",
      });

      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Failed to reject product:", error);
      toast({
        title: "Error",
        description: "Failed to reject product",
        variant: "destructive",
      });
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
      <SEO title="Product Queue - Dropship Auto-Pilot" />
      <Layout>
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Product Queue</h1>
            <p className="text-muted-foreground mt-1">Review and approve trending products from CJ Dropshipping</p>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No products pending approval</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-32 h-32 object-cover rounded border border-border"
                        />
                      )}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">CJ ID: <span className="font-mono">{product.cj_product_id}</span></p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Supplier Price:</span>
                            <span className="ml-2 font-semibold font-mono">${product.supplier_price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Suggested eBay Price:</span>
                            <span className="ml-2 font-semibold font-mono">${product.suggested_ebay_price.toFixed(2)}</span>
                          </div>
                        </div>
                        {product.category && (
                          <Badge variant="secondary">{product.category}</Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => handleApprove(product.id)} size="sm" className="whitespace-nowrap">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button onClick={() => handleReject(product.id)} size="sm" variant="destructive" className="whitespace-nowrap">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}