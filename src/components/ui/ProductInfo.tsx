import React from "react";
import Tabs from "@/components/ui/Tabs";
import type { Product } from "@/types/apiResponses";
import ReviewCard from "@/components/ui/ReviewCard";
import { formatProductPrice } from "@/utils/format";

interface ProductInfoProps {
  product: Product;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product, activeTab, setActiveTab }) => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center mb-2">
          <span className="inline-block bg-amber-500/90 text-black text-xs font-bold px-3 py-1 rounded-sm mr-3">
            {product.location}
          </span>
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-white/60 text-sm">(24 reviews)</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{product.name}</h1>
        <p className="text-xl font-bold text-amber-500">{formatProductPrice(product.price, product.currency)}</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { label: "Description", key: "description" },
          { label: "Details", key: "details" },
          { label: "Reviews", key: "reviews", count: 24 },
        ]}
        activeKey={activeTab}
        onTabChange={setActiveTab}
      >
        <React.Fragment>
          {activeTab === "description" && (
            <div className="prose prose-invert max-w-none max-h-50 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4 max-h-50 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900/50 p-4 rounded-sm">
                  <p className="text-white/60 text-sm mb-1">Origin</p>
                  <p className="font-medium">{product.location}</p>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-sm">
                  <p className="text-white/60 text-sm mb-1">Process</p>
                  <p className="font-medium">Washed</p>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-sm">
                  <p className="text-white/60 text-sm mb-1">Roast Level</p>
                  <p className="font-medium">Medium</p>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-sm">
                  <p className="text-white/60 text-sm mb-1">Flavor Notes</p>
                  <p className="font-medium">Chocolate, Citrus, Nutty</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 max-h-50 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
              {/* Sample reviews using ReviewCard */}
              <ReviewCard productName={product.name} stars={5} date="2 weeks ago" verified>
                Excellent coffee! The flavor is rich and complex, and I love that it's locally sourced.
              </ReviewCard>
              <ReviewCard productName={product.name} stars={4} date="2 weeks ago" verified>
                Great quality for the price. Will definitely buy again.
              </ReviewCard>
              <ReviewCard productName={product.name} stars={3} date="2 weeks ago" verified>
                This has become my go-to morning coffee. Smooth with no bitterness.
              </ReviewCard>
              <div className="border-t border-white/10 pt-4 mt-2">
                <button className="text-amber-500 font-medium hover:text-amber-400 transition-colors w-full text-center">
                  View all 24 reviews
                </button>
              </div>
            </div>
          )}
        </React.Fragment>
      </Tabs>
    </div>
  );
};

export default ProductInfo;
