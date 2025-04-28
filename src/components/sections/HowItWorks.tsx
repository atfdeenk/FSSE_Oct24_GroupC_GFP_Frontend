export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-neutral-900 px-6 py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>
      <div className="absolute -left-20 top-1/3 w-40 h-40 rounded-full bg-amber-500/5 blur-3xl"></div>
      <div className="absolute -right-20 bottom-1/3 w-40 h-40 rounded-full bg-amber-500/5 blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="inline-block text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">Simple Process</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-fade-in delay-100">How It Works</h2>
          <div className="h-1 w-24 bg-amber-500 mx-auto mb-8 animate-fade-in delay-200"></div>
          <p className="text-white/70 max-w-xl mx-auto animate-fade-in delay-300">Our platform connects you with local coffee producers in three simple steps</p>
        </div>
        
        {/* Process steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
          
          {/* Step 1 */}
          <div className="bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-sm relative group hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-400">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-sm bg-neutral-800 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/10 transition-all duration-300">
              <span className="text-amber-500 text-2xl font-bold">01</span>
            </div>
            <div className="pt-8">
              <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Discover</h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">Browse our curated selection of premium local coffee from producers in your area.</p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-sm relative group hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-500">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-sm bg-neutral-800 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/10 transition-all duration-300">
              <span className="text-amber-500 text-2xl font-bold">02</span>
            </div>
            <div className="pt-8">
              <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Connect</h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">Message and purchase directly from trusted local producers with secure transactions.</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-sm relative group hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-600">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-sm bg-neutral-800 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/10 transition-all duration-300">
              <span className="text-amber-500 text-2xl font-bold">03</span>
            </div>
            <div className="pt-8">
              <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Enjoy</h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">Experience the freshest, most sustainable coffee while supporting your local economy.</p>
            </div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-20 animate-fade-in delay-700">
          <a href="/products" className="inline-flex items-center px-10 py-4 bg-amber-500 text-black rounded-sm hover:bg-amber-400 font-bold transition-all duration-300 text-lg">
            <span>Start Your Journey</span>
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
