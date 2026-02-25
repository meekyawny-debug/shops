"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export function ProductImages({ images }: { images: ProductImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground">No image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[600px]">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                index === selectedIndex
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || "Thumbnail"}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 aspect-square relative rounded-xl overflow-hidden bg-muted group cursor-zoom-in">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt || "Product image"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  );
}
