"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  Textarea,
} from "@shops/ui";
import { ArrowLeft, Search, Download, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ImportProductPage() {
  const router = useRouter();
  const [supplierType, setSupplierType] = useState<
    "CJ_DROPSHIPPING" | "ALIEXPRESS"
  >("CJ_DROPSHIPPING");
  const [productId, setProductId] = useState("");
  const [preview, setPreview] = useState<{
    title: string;
    description: string;
    images: { url: string; alt?: string }[];
    variants: {
      supplierVariantId: string;
      name: string;
      costPrice: number;
      stock: number;
    }[];
  } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [multiplier, setMultiplier] = useState(2.5);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const { data: stores } = trpc.store.list.useQuery();
  const previewQuery = trpc.product.previewFromSupplier.useQuery(
    { supplierType, productId },
    { enabled: false }
  );
  const importMutation = trpc.product.importFromSupplier.useMutation({
    onSuccess: (product) => {
      router.push(`/products/${product.id}`);
    },
  });

  async function handlePreview() {
    if (!productId.trim()) return;
    setPreviewing(true);
    setPreviewError("");
    try {
      const result = await previewQuery.refetch();
      if (result.data) {
        setPreview(result.data);
        setEditTitle(result.data.title);
        setEditDescription(result.data.description);
      }
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Failed to fetch product"
      );
    } finally {
      setPreviewing(false);
    }
  }

  function handleImport() {
    importMutation.mutate({
      supplierType,
      productId,
      retailPriceMultiplier: multiplier,
      storeIds: selectedStores,
    });
  }

  function toggleStore(storeId: string) {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Product</h1>
          <p className="text-muted-foreground">
            Import from CJ Dropshipping or AliExpress.
          </p>
        </div>
      </div>

      {/* Step 1: Fetch Product */}
      <Card>
        <CardHeader>
          <CardTitle>1. Find Product</CardTitle>
          <CardDescription>
            Enter a product ID or URL from a supplier.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select
                value={supplierType}
                onValueChange={(v) =>
                  setSupplierType(v as "CJ_DROPSHIPPING" | "ALIEXPRESS")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CJ_DROPSHIPPING">
                    CJ Dropshipping
                  </SelectItem>
                  <SelectItem value="ALIEXPRESS">AliExpress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Product ID or URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={
                    supplierType === "CJ_DROPSHIPPING"
                      ? "e.g. 1234567890"
                      : "e.g. 1005001234567890"
                  }
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                />
                <Button
                  onClick={handlePreview}
                  disabled={!productId.trim() || previewing}
                >
                  {previewing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Preview
                </Button>
              </div>
            </div>
          </div>
          {previewError && (
            <p className="text-sm text-destructive">{previewError}</p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Preview & Edit */}
      {preview && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>2. Edit Product Details</CardTitle>
              <CardDescription>
                Customize title and description for your brand.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Images */}
              {preview.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {preview.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={img.alt || `Image ${i + 1}`}
                      className="h-24 w-24 rounded-lg object-cover border flex-shrink-0"
                    />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Variants */}
              <div>
                <Label className="mb-2 block">Variants & Pricing</Label>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left">Variant</th>
                        <th className="p-3 text-right">Cost</th>
                        <th className="p-3 text-right">
                          Retail ({multiplier}x)
                        </th>
                        <th className="p-3 text-right">Margin</th>
                        <th className="p-3 text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.variants.map((v) => {
                        const retail = Number(
                          (v.costPrice * multiplier).toFixed(2)
                        );
                        const margin =
                          v.costPrice > 0
                            ? (
                                ((retail - v.costPrice) / retail) *
                                100
                              ).toFixed(0)
                            : "N/A";
                        return (
                          <tr key={v.supplierVariantId} className="border-b">
                            <td className="p-3">{v.name}</td>
                            <td className="p-3 text-right">
                              ${v.costPrice.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-medium">
                              ${retail.toFixed(2)}
                            </td>
                            <td className="p-3 text-right">
                              <Badge variant="success">{margin}%</Badge>
                            </td>
                            <td className="p-3 text-right">{v.stock}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Price Multiplier</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    step={0.1}
                    value={multiplier}
                    onChange={(e) =>
                      setMultiplier(Number(e.target.value) || 2.5)
                    }
                    className="w-24"
                  />
                  <div className="flex gap-2">
                    {[2, 2.5, 3].map((m) => (
                      <Button
                        key={m}
                        variant={multiplier === m ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMultiplier(m)}
                      >
                        {m}x
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Assign to Stores */}
          <Card>
            <CardHeader>
              <CardTitle>3. Assign to Stores</CardTitle>
              <CardDescription>
                Select which stores should carry this product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stores?.map((store) => (
                  <label
                    key={store.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.id)}
                      onChange={() => toggleStore(store.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{store.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        /{store.slug}
                      </span>
                    </div>
                    <Badge
                      variant={store.isActive ? "success" : "secondary"}
                    >
                      {store.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Import Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPreview(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Import Product
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
