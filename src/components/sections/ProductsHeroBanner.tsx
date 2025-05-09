// src/components/sections/ProductsHeroBanner.tsx
"use client";

import React from "react";

const ProductsHeroBanner: React.FC = () => (
  <div className="w-full bg-black relative overflow-hidden pt-20 px-1">
    <div className="absolute inset-0 bg-[url('/coffee-beans-dark.jpg')] bg-cover bg-center opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

    <div className="max-w-6xl mx-auto relative z-10 text-center">
      <span className="inline-block text-amber-500 font-bold tracking-widest uppercase text-sm mb-1 animate-fade-in">Discover</span>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-6 animate-fade-in delay-100">Premium Coffee Collection</h1>
      <div className="h-1 w-24 bg-amber-500 mx-auto mb-8 animate-fade-in delay-200"></div>
      <p className="text-white/80 max-w-2xl mx-auto text-lg animate-fade-in delay-300 mb-8">
        Explore our curated selection of locally sourced, artisanal coffee products
      </p>
    </div>
  </div>
);

export default ProductsHeroBanner;
