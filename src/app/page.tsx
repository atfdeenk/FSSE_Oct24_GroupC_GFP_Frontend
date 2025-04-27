"use client";
import "./globals.css";
import "./animations.css";
import { useState } from "react";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import SellerModal from "../components/SellerModal";
import TestimonialsAndPress from "../components/TestimonialsAndPress";
import ProblemStatement from "../components/ProblemStatement";
import SolutionSection from "../components/SolutionSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorks from "../components/HowItWorks";

export default function Home() {
  const [showSellerModal, setShowSellerModal] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-green-50 font-sans">
      <HeroSection onBecomeSeller={() => setShowSellerModal(true)} />
      <TestimonialsAndPress />
      <ProblemStatement />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorks />
      <Footer />
      <SellerModal show={showSellerModal} onClose={() => setShowSellerModal(false)} />
    </div>
  );
}
