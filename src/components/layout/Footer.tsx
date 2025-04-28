"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-neutral-900 to-transparent opacity-50"></div>
      
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">bumibrew</h2>
            <p className="text-white/70 mb-6">Building sustainable communities, one purchase at a time.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-sm bg-white/5 hover:bg-amber-500/20 flex items-center justify-center text-white/80 hover:text-amber-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-sm bg-white/5 hover:bg-amber-500/20 flex items-center justify-center text-white/80 hover:text-amber-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-sm bg-white/5 hover:bg-amber-500/20 flex items-center justify-center text-white/80 hover:text-amber-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-white/70 hover:text-amber-400 transition-colors">Home</a></li>
              <li><a href="/products" className="text-white/70 hover:text-amber-400 transition-colors">Shop</a></li>
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">Contact</a></li>
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">Blog</a></li>
            </ul>
          </div>
          
          {/* Help */}
          <div>
            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-4">Help</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">Shipping Information</a></li>
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">Returns & Exchange</a></li>
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-amber-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-4">Newsletter</h3>
            <p className="text-white/70 mb-4">Subscribe to our newsletter for updates on new products and special promotions.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 flex-grow"
                required
              />
              <button 
                type="submit" 
                className="bg-amber-500 text-black px-4 py-2 rounded-sm ml-2 font-bold hover:bg-amber-400 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} bumibrew. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/50 text-sm hover:text-amber-400 transition-colors">Terms</a>
            <a href="#" className="text-white/50 text-sm hover:text-amber-400 transition-colors">Privacy</a>
            <a href="#" className="text-white/50 text-sm hover:text-amber-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
