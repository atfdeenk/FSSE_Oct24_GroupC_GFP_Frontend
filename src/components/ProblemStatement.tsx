"use client";

export default function ProblemStatement() {
  return (
    <section className="w-full bg-black px-6 py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="md:flex items-center gap-16">
          {/* Left side - Image */}
          <div className="md:w-1/2 mb-12 md:mb-0 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 border-2 border-amber-500/20 transform translate-x-4 translate-y-4 rounded-sm"></div>
              <img 
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80" 
                alt="Coffee farmers" 
                className="w-full h-[400px] object-cover rounded-sm shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-amber-500 text-black p-6 rounded-sm shadow-xl animate-fade-in delay-300">
                <p className="font-bold text-xl">90%</p>
                <p className="text-sm">of local producers struggle to reach nearby markets</p>
              </div>
            </div>
          </div>
          
          {/* Right side - Content */}
          <div className="md:w-1/2">
            <span className="inline-block text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">The Challenge</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-fade-in delay-100">Disconnected Communities</h2>
            <div className="h-1 w-24 bg-amber-500 mb-8 animate-fade-in delay-200"></div>
            
            <p className="text-white/80 text-lg mb-6 animate-fade-in delay-300">
              In many communities, local coffee producers and artisans struggle to connect with nearby consumers, leading to economic challenges and increased reliance on long-distance shipping.
            </p>
            
            <p className="text-white/80 text-lg mb-8 animate-fade-in delay-400">
              This not only affects local economies but also contributes to higher carbon emissions and less sustainable consumption patterns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 animate-fade-in delay-500">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-sm bg-amber-500/10 flex items-center justify-center mr-4 mt-1">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Economic Impact</h3>
                  <p className="text-white/70">Reduced income for local producers and higher prices for consumers</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-sm bg-amber-500/10 flex items-center justify-center mr-4 mt-1">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Environmental Cost</h3>
                  <p className="text-white/70">Increased carbon footprint from long-distance transportation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
