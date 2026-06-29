import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConnectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [ebayConnected, setEbayConnected] = useState(false);
  const [cjConnected, setCjConnected] = useState(false);
  const [cjApiKey, setCjApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    checkConnections();
  }, [router]);

  const checkConnections = async () => {
    try {
      const [ebayRes, cjRes] = await Promise.all([
        supabase.from("ebay_tokens").select("id").limit(1).single(),
        supabase.from("cj_credentials").select("id").limit(1).single(),
      ]);

      setEbayConnected(!!ebayRes.data);
      setCjConnected(!!cjRes.data);
    } catch (error) {
      console.error("Failed to check connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEbayConnect = () => {
    const ebayAuthUrl = `/api/ebay/auth/start`;
    window.location.href = ebayAuthUrl;
  };

  const handleCjSave = async () => {
    if (!cjApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a CJ Dropshipping API key",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("cj_credentials")
        .upsert({ id: "00000000-0000-0000-0000-000000000001", api_key: cjApiKey, access_token: "", expires_at: new Date().toISOString() });

      if (error) throw error;

      toast({
        title: "Success",
        description: "CJ Dropshipping API key saved",
      });
      setCjConnected(true);
      setCjApiKey("");
    } catch (error) {
      console.error("Failed to save CJ credentials:", error);
      toast({
        title: "Error",
        description: "Failed to save CJ API key",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      <SEO title="Connect - Dropship Auto-Pilot" />
      <Layout>
        <div className="p-8 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Connect Accounts</h1>
            <p className="text-muted-foreground mt-1">Link your eBay and CJ Dropshipping accounts</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>eBay Account</CardTitle>
                  <CardDescription>Connect your eBay seller account via OAuth</CardDescription>
                </div>
                {ebayConnected ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Authorize this app to manage your eBay inventory, listings, and orders. Required scopes: sell.inventory, sell.fulfillment, sell.account.
              </p>
              <Button onClick={handleEbayConnect} disabled={ebayConnected}>
                <ExternalLink className="w-4 h-4 mr-2" />
                {ebayConnected ? "Reconnect eBay Account" : "Connect eBay Account"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CJ Dropshipping</CardTitle>
                  <CardDescription>Enter your CJ Dropshipping API key</CardDescription>
                </div>
                {cjConnected ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Find your API key in your CJ Dropshipping account: My CJ → Authorization → Stores → API
              </p>
              <div className="space-y-2">
                <Label htmlFor="cj-api-key">API Key</Label>
                <Input
                  id="cj-api-key"
                  type="password"
                  value={cjApiKey}
                  onChange={(e) => setCjApiKey(e.target.value)}
                  placeholder="Enter your CJ Dropshipping API key"
                  className="font-mono"
                />
              </div>
              <Button onClick={handleCjSave} disabled={saving}>
                {saving ? "Saving..." : "Save API Key"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}