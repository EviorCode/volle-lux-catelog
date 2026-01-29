"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  imagesAlt?: string[];
  mainImageAlt?: string;
}

export function ProductGallery({
  images,
  productName,
  imagesAlt,
  mainImageAlt,
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const displayImages =
    images.length > 0
      ? images
      : [
        "https://images.unsplash.com/photo-1680034977375-3d83ee017e52?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
      ];

  // Get alt text for current image
  const getImageAlt = (index: number): string => {
    if (index === 0 && mainImageAlt) {
      return mainImageAlt;
    }
    if (imagesAlt && imagesAlt[index]) {
      return imagesAlt[index];
    }
    return `${productName} - Image ${index + 1}`;
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary/30 border border-border/30">
          <Image
            src={displayImages[selectedImageIndex]}
            alt={getImageAlt(selectedImageIndex)}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={selectedImageIndex === 0}
            loading={selectedImageIndex === 0 ? "eager" : "lazy"}
            placeholder="empty"
          />
        </div>

        {/* Navigation Arrows - Only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${index === selectedImageIndex
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border/30 opacity-70 hover:opacity-100 hover:border-border"
                }`}
              aria-label={`View ${getImageAlt(index)}`}
            >
              <Image
                src={image}
                alt={`${getImageAlt(index)} - Thumbnail`}
                fill
                className="object-cover"
                sizes="80px"
                placeholder="empty"
                loading="lazy"
                priority={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
