"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title?: string;
  description?: string;
  mediaType?: "image" | "video";
  image?: string;
  alt?: string;
  video?: string;
  videoPoster?: string;
  videoSettings?: {
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    showControls: boolean;
  };
}

interface HeroCarouselProps {
  banners: Banner[];
}

const TRANSITION_DURATION = 700;

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isTransitioningRef = useRef(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  const nextSlide = useCallback(() => {
    if (!banners || banners.length === 0 || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setTimeout(() => {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, TRANSITION_DURATION);
  }, [banners]);

  const prevSlide = useCallback(() => {
    if (!banners || banners.length === 0 || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, TRANSITION_DURATION);
  }, [banners]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, TRANSITION_DURATION);
  }, []);

  // Touch/swipe support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) nextSlide();
    else if (diff < -threshold) prevSlide();
  }, [nextSlide, prevSlide]);

  const pauseAutoPlay = useCallback(() => setIsAutoPlaying(false), []);
  const resumeAutoPlay = useCallback(() => setIsAutoPlaying(true), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      else if (e.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || !banners || banners.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, banners]);

  // PERFORMANCE: Pause/play videos based on active slide
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      if (index === currentSlide) {
        video.play().catch(() => {
          // Autoplay failed, ignore
        });
      } else {
        video.pause();
      }
    });
  }, [currentSlide]);

  if (!banners || banners.length === 0) return null;

  return (
    <div
      className="relative w-full h-[600px] overflow-hidden bg-gray-900"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ willChange: "transform" }}
    >
      {/* Slides */}
      {banners.map((banner, index) => {
        const isVideo = banner.mediaType === "video" && banner.video;
        const isActive = index === currentSlide;
        
        // PERFORMANCE: Only render first 2 slides initially
        if (!isClient && index > 1) return null;

        return (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            style={{
              transitionDuration: `${TRANSITION_DURATION}ms`,
              willChange: isActive ? "opacity" : "auto",
            }}
          >
            {/* Media Layer */}
            {isVideo ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                autoPlay={index === 0} // Only autoplay first video
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                preload={index === 0 ? "auto" : "none"} // PERFORMANCE: Only preload first video
                poster={banner.videoPoster}
                disablePictureInPicture
                disableRemotePlayback
                // PERFORMANCE: Only set fetchPriority for first video
                {...(index === 0 && {
                  fetchPriority: "high" as const,
                })}
              >
                <source src={banner.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.alt || "Hero banner"}
                  fill
                  className="object-cover"
                  priority={index === 0} // PERFORMANCE: Only priority load first image
                  quality={90}
                  sizes="100vw"
                />
              )
            )}

            {/* Sophisticated Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content Layer */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                {banner.title && (
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {banner.title}
                  </h1>
                )}
                {banner.description && (
                  <p className="text-lg md:text-xl mb-8 drop-shadow-md">
                    {banner.description}
                  </p>
                )}
                <Link
                  href="/shop"
                  className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Shop Collection
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Minimalist Controls */}
      {banners.length > 1 && (
        <>
          {/* Arrows - Only visible on hover/large screens */}
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <button
              onClick={prevSlide}
              className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Pagination Dots - Centered bottom */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}