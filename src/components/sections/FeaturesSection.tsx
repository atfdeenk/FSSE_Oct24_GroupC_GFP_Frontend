"use client";

export default function FeaturesSection() {
  return (
    <section className="w-full bg-neutral-900 px-6 py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">Platform Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-fade-in delay-100">Everything You Need</h2>
          <div className="h-1 w-24 bg-amber-500 mx-auto mb-8 animate-fade-in delay-200"></div>
          <p className="text-white/80 max-w-2xl mx-auto text-lg animate-fade-in delay-300">
            Our platform provides all the tools needed to connect local producers with coffee enthusiasts
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-300">
            <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 3v18" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Market Discovery</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Find unique products and producers in your area with advanced search and filtering options.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-400">
            <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="8" strokeWidth={2} />
              </svg>
            </div>
            <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Seller Profiles</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Learn about artisans and their stories, with detailed information about their production methods.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-500">
            <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            </div>
            <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Sustainable Checkout</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Eco-friendly payment and delivery options that minimize environmental impact.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-300">
            <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20v-6" />
                <circle cx="12" cy="10" r="4" strokeWidth={2} />
              </svg>
            </div>
            <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Community Reviews</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Read and share experiences with local sellers to build trust within the community.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-400">
            <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            </div>
            <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Promotions & Local Currency</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Special deals and support for local payment methods to enhance the shopping experience.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-500">
            <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="8" strokeWidth={2} />
              </svg>
            </div>
            <h3 className="font-bold text-white text-xl mb-4 group-hover:text-amber-400 transition-colors duration-300">Eco Impact Tracker</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              See your positive environmental impact by shopping local and supporting sustainable practices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}