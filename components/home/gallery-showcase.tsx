"use client";
import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

const galleryItems = [
    {
        id: 1,
        type: "image" as const,
        src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
        alt: "Warehouse facility",
        title: "Modern Warehouse",
    },
    {
        id: 2,
        type: "video" as const,
        src: "/videos/warehouse-tour.mp4", // Placeholder path
        thumbnail: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80",
        alt: "Warehouse tour video",
        title: "Facility Tour",
    },
    {
        id: 3,
        type: "image" as const,
        src: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80",
        alt: "Product inventory",
        title: "Product Range",
    },
    {
        id: 4,
        type: "image" as const,
        src: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&q=80",
        alt: "Shipping operations",
        title: "Fast Dispatch",
    },
    {
        id: 5,
        type: "image" as const,
        src: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80",
        alt: "Packaging materials",
        title: "Quality Materials",
    },
];

export function GalleryShowcase() {
    const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null);

    return (
        <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">

                {/* Section Header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-3">
                        Behind the Scenes
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Explore our state-of-the-art warehouse, product range, and wholesale operations.
                    </p>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {galleryItems.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`
                group relative overflow-hidden rounded-xl bg-secondary/50 
                transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                ${index === 1 ? 'md:col-span-2 md:row-span-2' : 'aspect-square'}
              `}
                        >
                            <Image
                                src={item.type === 'video' ? item.thumbnail! : item.src}
                                alt={item.alt}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Play Icon for Videos */}
                            {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                                        <Play className="w-5 h-5 md:w-7 md:h-7 text-white fill-white" />
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-xs md:text-sm font-semibold">{item.title}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Lightbox Modal */}
                {selectedItem && (
                    <div
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedItem(null)}
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                            {selectedItem.type === 'video' ? (
                                <video
                                    src={selectedItem.src}
                                    controls
                                    autoPlay
                                    className="w-full h-auto rounded-lg"
                                    poster={selectedItem.thumbnail}
                                />
                            ) : (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={selectedItem.src}
                                        alt={selectedItem.alt}
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto rounded-lg object-contain"
                                    />
                                </div>
                            )}
                            <p className="text-white text-center mt-4 text-sm md:text-base">{selectedItem.title}</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
