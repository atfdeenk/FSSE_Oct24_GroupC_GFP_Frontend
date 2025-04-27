"use client";

interface TestimonialsAndPressProps {
  onJoinCommunity: () => void;
}

export default function TestimonialsAndPress({ onJoinCommunity }: TestimonialsAndPressProps) {
  return (
    <section className="w-full bg-black px-6 py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-neutral-900 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-neutral-900 to-transparent"></div>

      {/* Decorative quotes */}
      <div className="absolute top-20 left-10 text-9xl text-amber-500/10 font-serif">"</div>
      <div className="absolute bottom-20 right-10 text-9xl text-amber-500/10 font-serif">"</div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-fade-in delay-100">What Our Community Says</h2>
          <div className="h-1 w-24 bg-amber-500 mx-auto mb-8 animate-fade-in delay-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Testimonial 1 */}
          <div className="group bg-neutral-900/80 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-sm overflow-hidden mr-4 border-2 border-amber-500/20">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100"
                  alt="Customer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-white">Maya</p>
                <p className="text-white/60 text-sm">Jakarta</p>
              </div>
            </div>
            <div className="relative">
              <svg className="absolute -top-3 -left-1 w-6 h-6 text-amber-500/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white/80 italic mb-4 pl-6">"I love finding fresh, local coffee! The platform is so easy to use and connects me directly with amazing producers."</p>
              <div className="flex items-center">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="group bg-neutral-900/80 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-400">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-sm overflow-hidden mr-4 border-2 border-amber-500/20">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100"
                  alt="Customer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-white">Pak Budi</p>
                <p className="text-white/60 text-sm">Bandung</p>
              </div>
            </div>
            <div className="relative">
              <svg className="absolute -top-3 -left-1 w-6 h-6 text-amber-500/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white/80 italic mb-4 pl-6">"Bumibrew helps my small coffee farm reach more people in my city. My business has grown 40% since joining the platform."</p>
              <div className="flex items-center">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="group bg-neutral-900/80 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all duration-300 animate-fade-in delay-500">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-sm overflow-hidden mr-4 border-2 border-amber-500/20">
                <img
                  src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=100"
                  alt="Customer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-white">Sari</p>
                <p className="text-white/60 text-sm">Surabaya</p>
              </div>
            </div>
            <div className="relative">
              <svg className="absolute -top-3 -left-1 w-6 h-6 text-amber-500/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white/80 italic mb-4 pl-6">"Shopping here feels good because I know I'm supporting local artisans. The coffee quality is amazing and I love the direct connection."</p>
              <div className="flex items-center">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial CTA */}
        <div className="text-center mt-16 animate-fade-in delay-600">
          <p className="text-white/70 mb-6">Join thousands of satisfied customers and producers on our platform</p>
          <button 
            onClick={onJoinCommunity}
            className="inline-flex items-center px-8 py-3 bg-amber-500 text-black rounded-sm hover:bg-amber-400 font-bold transition-all duration-300"
          >
            <span>Join Our Community</span>
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}