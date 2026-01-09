import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { getNewArrivalsList } from "@/services/products/product.service";

export async function NewArrivals() {
  const newArrivals = await getNewArrivalsList();

  return (
    <section className="relative py-16 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-gradient-to-br from-teal-100/30 to-emerald-100/30 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-100/30 to-cyan-100/30 rounded-full blur-3xl translate-x-1/2" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        {/* Section Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-2xl">  
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              NEW
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-1">
                ARRIVALS
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              See what is new in our wholesale packaging line with new bubble wrap roll wholesale UK, mailing bags, boxes and your protective packing solutions.
            </p>
          </div>
          
          <Button asChild variant="ghost" className="w-fit group p-0 h-auto hover:bg-transparent">
            <Link
              href="/products?sort=newest"
              className="relative overflow-hidden flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-200 hover:scale-105 active:scale-100"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">View All</span>
              <ArrowRight
                className="relative h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </Link>
          </Button>
        </div>

        {/* Grid Layout */}
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No new arrivals yet
            </h3>
            <p className="text-base text-gray-600 max-w-md">
              Check back soon for our latest packaging innovations and products.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}