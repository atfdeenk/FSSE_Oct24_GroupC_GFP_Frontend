"use client";

export default function SolutionSection() {
  return (
    <section className="w-full bg-neutral-900 px-6 py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 w-1/3 h-screen bg-gradient-to-bl from-amber-500/5 to-transparent"></div>
      <div className="absolute -right-20 top-1/4 w-40 h-40 rounded-full bg-amber-500/5 blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">Our Approach</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-fade-in delay-100">The bumibrew Solution</h2>
          <div className="h-1 w-24 bg-amber-500 mx-auto mb-8 animate-fade-in delay-200"></div>
          <p className="text-white/80 max-w-2xl mx-auto text-lg animate-fade-in delay-300">
            Bumibrew bridges the gap between local producers and consumers, fostering sustainable trade, supporting local businesses, and reducing environmental impact.
          </p>
        </div>
        
        {/* Solution cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-sm relative hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-400 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-amber-500">
                  <path stroke="currentColor" strokeWidth="2" d="M6 8V6a6 6 0 1 1 12 0v2"/>
                  <rect width="16" height="12" x="4" y="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Shop Local & Fresh</h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                Access the freshest coffee directly from local producers, with complete transparency about origins and practices.
              </p>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="group bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-sm relative hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-amber-500">
                  <path stroke="currentColor" strokeWidth="2" d="M12 3v18m0 0c-4.418 0-8-3.582-8-8 0-6 8-10 8-10s8 4 8 10c0 4.418-3.582 8-8 8Z"/>
                </svg>
              </div>
              <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Reduce Carbon Footprint</h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                Minimize environmental impact through shorter supply chains and support for sustainable farming practices.
              </p>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="group bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-sm relative hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-amber-500">
                  <path stroke="currentColor" strokeWidth="2" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
                  <path stroke="currentColor" strokeWidth="2" d="M7 13l5 5 5-5"/>
                </svg>
              </div>
              <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Support Local Communities</h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                Strengthen local economies by ensuring fair compensation for producers and creating sustainable livelihoods.
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in delay-700">
          <div className="text-center p-6 border-t border-amber-500/20">
            <p className="text-4xl font-black text-amber-500 mb-2">85%</p>
            <p className="text-white/70">Higher earnings for local producers</p>
          </div>
          <div className="text-center p-6 border-t border-amber-500/20">
            <p className="text-4xl font-black text-amber-500 mb-2">60%</p>
            <p className="text-white/70">Reduction in carbon emissions</p>
          </div>
          <div className="text-center p-6 border-t border-amber-500/20">
            <p className="text-4xl font-black text-amber-500 mb-2">2,000+</p>
            <p className="text-white/70">Local producers supported</p>
          </div>
        </div>
      </div>
    </section>
  );
}
