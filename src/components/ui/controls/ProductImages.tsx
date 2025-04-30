import React from "react";
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface ProductImagesProps {
  imageUrl: string;
  name: string;
}

const ProductImages: React.FC<ProductImagesProps> = ({ imageUrl, name }) => {
  return (
    <div className="space-y-6">
      <div className="relative h-80 overflow-hidden bg-neutral-900 rounded-t-sm">
        <img
          src={getImageUrl(imageUrl)}
          alt={name}
          className="w-full h-full object-cover rounded-md"
          onError={handleImageError()}
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {/* Thumbnail images - in a real app, you'd have multiple images */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`aspect-square overflow-hidden rounded-sm cursor-pointer border ${i === 0 ? 'border-amber-500' : 'border-white/10'} bg-neutral-900/50`}
          >
            <img
              src={getImageUrl(imageUrl)}
              alt={`${name} view ${i + 1}`}
              className="w-full h-full object-cover"
              onError={handleImageError()}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
