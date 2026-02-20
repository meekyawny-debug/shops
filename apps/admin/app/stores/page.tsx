"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Switch,
} from "@shops/ui";
import { Plus, ExternalLink, Settings } from "lucide-react";

export default function StoresPage() {
  const { data: stores, isLoading, refetch } = trpc.store.list.useQuery();
  const toggleActive = trpc.store.toggleActive.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground">
            Manage your branded storefronts.
          </p>
        </div>
        <Link href="/stores/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Store
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-48 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores?.map((store) => (
            <Card key={store.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">{store.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    /{store.slug}
                    {store.domain && ` · ${store.domain}`}
                  </p>
                </div>
                <Switch
                  checked={store.isActive}
                  onCheckedChange={(checked) =>
                    toggleActive.mutate({ id: store.id, isActive: checked })
                  }
                />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{store._count.storeProducts} products</span>
                  <span>{store._count.orders} orders</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/stores/${store.id}`}>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-3 w-3" />
                      Manage
                    </Button>
                  </Link>
                  {store.domain && (
                    <a
                      href={`https://${store.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Visit
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
