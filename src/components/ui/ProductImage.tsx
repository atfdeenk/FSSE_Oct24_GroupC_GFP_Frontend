// src/components/ui/ProductImage.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";

export interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onError?: (e: any) => void;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, width = 400, height = 192, className = '', onError }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoadingComplete={() => setImageLoaded(true)}
        onError={onError}
        loading="lazy"
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
      )}
    </div>
  );
};

export default ProductImage;
