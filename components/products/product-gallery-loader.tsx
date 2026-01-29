// PERFORMANCE: Loading skeleton for ProductGallery dynamic import
export function ProductGallerySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Main Image Skeleton */}
      <div className="aspect-square w-full bg-secondary/50 rounded-2xl" />

      {/* Thumbnail Skeletons */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 w-16 md:h-20 md:w-20 bg-secondary/50 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
