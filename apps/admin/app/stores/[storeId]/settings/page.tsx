"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Separator,
} from "@shops/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function StoreSettingsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const router = useRouter();
  const { data: store, isLoading } = trpc.store.getById.useQuery({
    id: storeId,
  });
  const updateStore = trpc.store.update.useMutation({
    onSuccess: () => router.push(`/stores/${storeId}`),
  });
  const updateConfig = trpc.store.updateConfig.useMutation({
    onSuccess: () => router.push(`/stores/${storeId}`),
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [fontHeading, setFontHeading] = useState("Inter");
  const [fontBody, setFontBody] = useState("Inter");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [gaTrackingId, setGaTrackingId] = useState("");
  const [fbPixelId, setFbPixelId] = useState("");

  useEffect(() => {
    if (store) {
      setName(store.name);
      setSlug(store.slug);
      setDomain(store.domain || "");
      if (store.config) {
        setPrimaryColor(store.config.primaryColor);
        setSecondaryColor(store.config.secondaryColor);
        setAccentColor(store.config.accentColor);
        setFontHeading(store.config.fontHeading);
        setFontBody(store.config.fontBody);
        setMetaTitle(store.config.metaTitle || "");
        setMetaDescription(store.config.metaDescription || "");
        setSocialInstagram(store.config.socialInstagram || "");
        setGaTrackingId(store.config.gaTrackingId || "");
        setFbPixelId(store.config.fbPixelId || "");
      }
    }
  }, [store]);

  function handleSave() {
    updateStore.mutate({
      id: storeId,
      name,
      slug,
      domain: domain || null,
    });
    updateConfig.mutate({
      storeId,
      config: {
        primaryColor,
        secondaryColor,
        accentColor,
        fontHeading,
        fontBody,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        socialInstagram: socialInstagram || null,
        gaTrackingId: gaTrackingId || null,
        fbPixelId: fbPixelId || null,
      },
    });
  }

  if (isLoading) {
    return <div className="animate-pulse h-96 rounded bg-muted" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${storeId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {store?.name} Settings
          </h1>
          <p className="text-muted-foreground">Store configuration and branding.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Custom Domain</Label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Colors and fonts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Input
                value={fontHeading}
                onChange={(e) => setFontHeading(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Input
                value={fontBody}
                onChange={(e) => setFontBody(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Store name — tagline"
            />
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Input
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="A brief description of the store"
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Instagram URL</Label>
            <Input
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Google Analytics ID</Label>
              <Input
                value={gaTrackingId}
                onChange={(e) => setGaTrackingId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Facebook Pixel ID</Label>
              <Input
                value={fbPixelId}
                onChange={(e) => setFbPixelId(e.target.value)}
                placeholder="123456789"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={updateStore.isPending}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
