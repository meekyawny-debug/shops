"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Separator,
} from "@shops/ui";
import { ArrowLeft, Trash2, Save, Plus } from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { data: product, isLoading, refetch } = trpc.product.getById.useQuery({
    id: productId,
  });
  const { data: stores } = trpc.store.list.useQuery();
  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: () => router.push("/products"),
  });
  const assignToStore = trpc.product.assignToStore.useMutation({
    onSuccess: () => refetch(),
  });
  const removeFromStore = trpc.product.removeFromStore.useMutation({
    onSuccess: () => refetch(),
  });

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (isLoading) {
    return <div className="animate-pulse h-96 rounded bg-muted" />;
  }

  if (!product) return <p>Product not found.</p>;

  const assignedStoreIds = product.storeProducts.map((sp) => sp.store.id);
  const unassignedStores =
    stores?.filter((s) => !assignedStoreIds.includes(s.id)) || [];

  function startEditing() {
    setTitle(product!.title);
    setDescription(product!.description);
    setEditing(true);
  }

  function saveEdits() {
    updateProduct.mutate({
      id: productId,
      title,
      description,
    });
    setEditing(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {product.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">
              {product.supplierType.replace("_", " ")}
            </Badge>
            {product.category && (
              <Badge variant="secondary">{product.category}</Badge>
            )}
          </div>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => {
            if (confirm("Delete this product?")) {
              deleteProduct.mutate({ id: productId });
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Images */}
      {product.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {product.images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={img.alt || product.title}
              className="h-32 w-32 rounded-lg object-cover border flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product Details</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdits}>
                  <Save className="mr-2 h-3 w-3" /> Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Base Cost: ${Number(product.baseCost).toFixed(2)}</p>
                {product.supplierProductId && (
                  <p>Supplier ID: {product.supplierProductId}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-right">Cost</th>
                  <th className="p-3 text-right">Retail</th>
                  <th className="p-3 text-right">Stock</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <tr key={v.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{v.sku}</td>
                    <td className="p-3">{v.name}</td>
                    <td className="p-3 text-right">
                      ${Number(v.costPrice).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      ${Number(v.retailPrice).toFixed(2)}
                    </td>
                    <td className="p-3 text-right">{v.stock}</td>
                    <td className="p-3 text-center">
                      <Badge variant={v.isActive ? "success" : "secondary"}>
                        {v.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Store Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Store Assignment</CardTitle>
          <CardDescription>
            Which stores carry this product.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {product.storeProducts.map((sp) => (
            <div
              key={sp.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <Link
                  href={`/stores/${sp.store.id}`}
                  className="font-medium hover:underline"
                >
                  {sp.store.name}
                </Link>
                {sp.priceOverride && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    Override: ${Number(sp.priceOverride).toFixed(2)}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  removeFromStore.mutate({
                    storeId: sp.store.id,
                    productId,
                  })
                }
              >
                Remove
              </Button>
            </div>
          ))}

          {unassignedStores.length > 0 && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Add to store:
              </p>
              <div className="flex flex-wrap gap-2">
                {unassignedStores.map((store) => (
                  <Button
                    key={store.id}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      assignToStore.mutate({
                        productId,
                        storeId: store.id,
                      })
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {store.name}
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
