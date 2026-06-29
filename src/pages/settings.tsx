import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  id: string;
  default_margin_percent: number;
  sync_interval_minutes: number;
  category_blacklist: string[];
  brand_keyword_blacklist: string[];
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    id: "00000000-0000-0000-0000-000000000001",
    default_margin_percent: 30,
    sync_interval_minutes: 10,
    category_blacklist: [],
    brand_keyword_blacklist: [],
  });
  const [categoryText, setCategoryText] = useState("");
  const [brandText, setBrandText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data) {
        setSettings(data);
        setCategoryText((data.category_blacklist || []).join("\n"));
        setBrandText((data.brand_keyword_blacklist || []).join("\n"));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const categoryList = categoryText.split("\n").map(s => s.trim()).filter(Boolean);
      const brandList = brandText.split("\n").map(s => s.trim()).filter(Boolean);

      const { error } = await supabase
        .from("settings")
        .upsert({
          ...settings,
          category_blacklist: categoryList,
          brand_keyword_blacklist: brandList,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
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
      <SEO title="Settings - Dropship Auto-Pilot" />
      <Layout>
        <div className="p-8 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure automation parameters</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Sync</CardTitle>
              <CardDescription>Default profit margin and sync frequency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="margin">Default Margin (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={settings.default_margin_percent}
                    onChange={(e) => setSettings({ ...settings, default_margin_percent: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">Applied to all new products</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Sync Interval (minutes)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={settings.sync_interval_minutes}
                    onChange={(e) => setSettings({ ...settings, sync_interval_minutes: parseInt(e.target.value) || 10 })}
                    min="5"
                    max="1440"
                  />
                  <p className="text-xs text-muted-foreground">How often to sync orders and inventory</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Blacklist</CardTitle>
              <CardDescription>Auto-reject products from these categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={categoryText}
                onChange={(e) => setCategoryText(e.target.value)}
                placeholder="Enter one category per line&#10;e.g., Electronics&#10;Clothing&#10;Toys"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">Products matching these categories will be auto-rejected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Keyword Blacklist</CardTitle>
              <CardDescription>Auto-reject products containing these brand names</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={brandText}
                onChange={(e) => setBrandText(e.target.value)}
                placeholder="Enter one brand/keyword per line&#10;e.g., Nike&#10;Apple&#10;Disney"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">Helps avoid trademark/IP issues with auto-discovered products</p>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </Layout>
    </>
  );
}