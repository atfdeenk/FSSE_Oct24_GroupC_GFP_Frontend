"use client";

interface HeroSectionProps {
  onBecomeSeller: () => void;
  onJoinCommunity: () => void;
}

export default function HeroSection({ onBecomeSeller, onJoinCommunity }: HeroSectionProps) {
  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-black">
      {/* Left side - Image with overlay */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-20"></div>
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085')] 
                     bg-cover bg-center animate-ken-burns"
          style={{
            backgroundPosition: 'center',
            animation: 'kenBurns 20s infinite alternate ease-in-out',
          }}
        ></div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-amber-500/20 animate-float-slow z-10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-amber-700/20 animate-float-slower z-10"></div>

        {/* Mobile overlay text - only visible on small screens */}
        <div className="md:hidden absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-30">
          <span className="text-amber-400 font-bold tracking-widest uppercase text-sm mb-2">Local • Fresh • Sustainable</span>
          <h1 className="text-5xl font-black text-white mb-4 leading-none">
            <span className="block">bumi</span>
            <span className="block text-amber-500">brew</span>
          </h1>
          <p className="text-white/80 max-w-xs mx-auto mb-8">Connecting local producers with coffee enthusiasts</p>

          {/* Mobile buttons */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <a href="/products" className="group relative px-6 py-3 bg-amber-500 text-black rounded-sm hover:bg-amber-400 font-bold transition-all duration-300 text-base outline-none overflow-hidden flex items-center justify-center">
              <span>Explore Products</span>
              <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 group relative px-3 py-3 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-all duration-300 outline-none rounded-sm flex items-center justify-center text-sm"
                onClick={onJoinCommunity}
              >
                <span>Join Us</span>
              </button>
              <button
                className="flex-1 group relative px-3 py-3 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-all duration-300 outline-none rounded-sm flex items-center justify-center text-sm"
                onClick={onBecomeSeller}
              >
                <span>Sell</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 xl:p-24 bg-gradient-to-br from-neutral-900 to-black">
        {/* Hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <span className="inline-block text-amber-400 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">Local • Fresh • Sustainable</span>
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 leading-none animate-fade-in">
            <span className="block">bumi</span>
            <span className="block text-amber-500">brew</span>
          </h1>
          <p className="text-xl lg:text-2xl text-white/80 max-w-md mb-8 animate-fade-in delay-100">Connecting local producers with coffee enthusiasts</p>

          <div className="h-1 w-24 bg-amber-500 mb-8 animate-fade-in delay-200"></div>

          <p className="text-white/70 max-w-md mb-10 animate-fade-in delay-300">
            Discover exceptional coffee directly from local farmers. Support sustainable practices, reduce your carbon footprint, and experience the freshest flavors your community has to offer.
          </p>

          {/* Desktop buttons - Improved layout */}
          <div className="animate-fade-in delay-400">
            {/* Primary CTA */}
            <div className="mb-6">
              <a href="/products" className="inline-flex items-center px-8 py-4 bg-amber-500 text-black rounded-sm hover:bg-amber-400 font-bold transition-all duration-300 text-lg outline-none overflow-hidden">
                <span>Explore Products</span>
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                className="group relative px-6 py-3 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-all duration-300 outline-none rounded-sm flex items-center"
                onClick={onJoinCommunity}
              >
                <span>Join Community</span>
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button
                className="group relative px-6 py-3 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-all duration-300 outline-none rounded-sm flex items-center"
                onClick={onBecomeSeller}
              >
                <span>Become a Seller</span>
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>

          <a href="#how-it-works" className="inline-flex items-center text-amber-400 mt-12 group animate-fade-in delay-500">
            <span className="mr-2">How it works</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
          <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center animate-fade-in delay-600">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-white/60 text-sm">Est. 2024</span>
            </div>


          </div>
        </div>
      </div>

      {/* Scroll indicator - absolutely positioned at the bottom center */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-20 hidden md:flex flex-col items-center animate-fade-in delay-700 z-50">
        <span className="text-white/60 text-xs mb-1">Scroll down</span>
        <svg className="animate-bounce w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

    </section>
  );
}
