export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Image Skeleton */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary/50">
        <div className="h-full w-full animate-pulse bg-secondary" />
      </div>

      {/* Product Info Skeleton */}
      <div className="space-y-2 px-1">
        {/* Title Skeleton */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded-md bg-secondary" />
        </div>

        {/* Price Row Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 animate-pulse rounded-md bg-secondary" />
          <div className="h-3 w-12 animate-pulse rounded-md bg-secondary/70" />
        </div>
      </div>
    </div>
  );
}
