"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@shops/ui";
import { trpc } from "@/lib/trpc";
import { StarRating, InteractiveStarRating } from "./star-rating";

export function ReviewSection({
  storeSlug,
  productId,
}: {
  storeSlug: string;
  productId: string;
}) {
  const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, refetch } = trpc.storefront.getProductReviews.useQuery(
    { storeSlug, productId, sort, page, limit: 10 },
    { enabled: !!storeSlug && !!productId }
  );

  if (isLoading || !data) {
    return (
      <section className="mt-16 pt-12 border-t">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
      </section>
    );
  }

  const { reviews, avgRating, reviewCount, starCounts, totalPages } = data;

  return (
    <section className="mt-16 pt-12 border-t" id="reviews">
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-primary/70 mb-2 block">
          Customer Reviews
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold">
          Reviews ({reviewCount})
        </h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 mb-10">
        {/* Average */}
        <div className="text-center md:text-left">
          <p className="font-heading text-5xl font-bold">{avgRating.toFixed(1)}</p>
          <StarRating rating={avgRating} size="md" />
          <p className="text-sm text-muted-foreground mt-1">
            Based on {reviewCount} reviews
          </p>
        </div>

        {/* Distribution */}
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] || 0;
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right">{star}</span>
                <span className="text-muted-foreground">★</span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden max-w-xs">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-muted-foreground text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Write a review button */}
        <div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setShowForm(!showForm)}
          >
            Write a Review
          </Button>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          storeSlug={storeSlug}
          productId={productId}
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}

      {/* Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as typeof sort);
              setPage(1);
            }}
            className="text-sm bg-transparent border rounded-md px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-b-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={review.rating} />
                  <span className="font-medium text-sm">{review.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{review.authorName}</span>
                  {review.verified && (
                    <span className="flex items-center gap-0.5 text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Purchase
                    </span>
                  )}
                  <span>·</span>
                  <span>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.body}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}

/* ─── Review Form ─────────────────────────────────────────── */

function ReviewForm({
  storeSlug,
  productId,
  onSuccess,
}: {
  storeSlug: string;
  productId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const mutation = trpc.storefront.createReview.useMutation({
    onSuccess,
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (body.length < 10) {
      setError("Review must be at least 10 characters.");
      return;
    }
    mutation.mutate({
      storeSlug,
      productId,
      rating,
      title,
      body,
      authorName: name,
      authorEmail: email,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-secondary/50 rounded-xl p-6 mb-8 space-y-4"
    >
      <h3 className="font-medium text-lg">Write a Review</h3>

      <div>
        <label className="text-sm text-muted-foreground block mb-1">Rating</label>
        <InteractiveStarRating rating={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
          placeholder="Summarize your experience"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1">Review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none"
          placeholder="Share your thoughts about this product..."
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className="rounded-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
