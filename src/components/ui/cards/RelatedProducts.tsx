import React from "react";
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface RelatedProduct {
  id: string | number;
  name: string;
  image_url: string;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (!products.length) return null;
  return (
    <div className="mt-24">
      <h2 className="text-2xl font-bold text-white mb-8">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(relatedProduct => (
          <a
            key={relatedProduct.id}
            href={`/products/${relatedProduct.id}`}
            className="group bg-neutral-900/50 backdrop-blur-sm rounded-sm overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 flex flex-col h-full"
          >
            <div className="relative overflow-hidden h-48">
              <img
                src={getImageUrl(relatedProduct.image_url)}
                alt={relatedProduct.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                onError={handleImageError()}
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-amber-400 transition-colors">
                {relatedProduct.name}
              </h3>
              <span className="text-white/60 text-sm mt-auto">View Product →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
