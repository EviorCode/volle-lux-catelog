import { HeroCarousel } from "./hero-carousel";
import { getBanners } from "@/services/banners/banner.service";
import { BicepsFlexed, Sprout, Truck } from "lucide-react";

export default async function HeroSection() {
  // Fetch banners from Sanity CMS
  const banners = await getBanners();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel Component - fetchpriority="high" applied in hero-carousel.tsx */}
      <HeroCarousel banners={banners} />

    </div>
  );
}
