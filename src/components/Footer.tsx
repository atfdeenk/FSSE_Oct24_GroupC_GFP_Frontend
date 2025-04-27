"use client";

export default function Footer() {
  return (
    <footer className="w-full py-8 bg-green-800 text-white text-center mt-auto">
      <div className="max-w-5xl mx-auto px-6">
        <p className="font-semibold text-lg mb-2">bumibrew</p>
        <p className="text-sm mb-4">Building sustainable communities, one purchase at a time.</p>
        <div className="flex gap-4 justify-center text-green-200">
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="hover:text-white">Contact</a>
          <a href="#" className="hover:text-white">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
