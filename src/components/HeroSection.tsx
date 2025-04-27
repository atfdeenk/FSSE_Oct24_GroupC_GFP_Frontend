"use client";

interface HeroSectionProps {
  onBecomeSeller: () => void;
  onJoinCommunity: () => void;
}

export default function HeroSection({ onBecomeSeller, onJoinCommunity }: HeroSectionProps) {
  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-black">
      {/* Left side - Image with overlay */}
      <div className="w-full md:w-1/2 h-screen relative overflow-hidden">
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
          <p className="text-white/80 max-w-xs mx-auto">Connecting local producers with coffee enthusiasts</p>
        </div>
      </div>
      
      {/* Right side - Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-gradient-to-br from-neutral-900 to-black">
        {/* Hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <span className="inline-block text-amber-400 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">Local • Fresh • Sustainable</span>
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-none animate-fade-in">
            <span className="block">bumi</span>
            <span className="block text-amber-500">brew</span>
          </h1>
          <p className="text-2xl text-white/80 max-w-md mb-8 animate-fade-in delay-100">Connecting local producers with coffee enthusiasts</p>
          
          <div className="h-1 w-24 bg-amber-500 mb-8 animate-fade-in delay-200"></div>
          
          <p className="text-white/70 max-w-md mb-12 animate-fade-in delay-300">
            Discover exceptional coffee directly from local farmers. Support sustainable practices, reduce your carbon footprint, and experience the freshest flavors your community has to offer.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 animate-fade-in delay-400">
            <a href="/products" className="group relative px-10 py-4 bg-amber-500 text-black rounded-sm hover:bg-amber-400 font-bold transition-all duration-300 text-lg outline-none overflow-hidden flex items-center">
              <span>Explore Products</span>
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="group relative px-8 py-4 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-all duration-300 outline-none rounded-sm flex items-center"
                onClick={onJoinCommunity}
                type="button"
              >
                <span>Join Community</span>
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              <button
                className="group relative px-8 py-4 border border-white/30 text-white hover:bg-white/10 transition-all duration-300 outline-none rounded-sm flex items-center"
                onClick={onBecomeSeller}
                type="button"
              >
                <span>Become a Seller</span>
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
            
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-amber-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-amber-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator - absolutely positioned at the bottom center */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 hidden md:flex flex-col items-center animate-fade-in delay-700 pointer-events-none select-none z-50" aria-hidden="true">
        <span className="text-white/60 text-xs mb-1">Scroll down</span>
        <svg className="animate-bounce w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

    </section>
  );
}
