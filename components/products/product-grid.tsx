import { ProductCard } from "./product-card"
import { Product } from "@/types/product"
import { Package } from "lucide-react"
import Link from "next/link"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        No products found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        We couldn't find any products matching your filters. Try adjusting your search or browse all products.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        View All Products
      </Link>
    </div>
  )
}
