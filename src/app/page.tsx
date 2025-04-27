"use client";
import "./globals.css";
import "./animations.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import SellerModal from "@/components/SellerModal";
import TestimonialsAndPress from "@/components/TestimonialsAndPress";
import ProblemStatement from "@/components/ProblemStatement";
import SolutionSection from "@/components/SolutionSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import RegisterModal from "@/components/RegisterModal";
import Header from "@/components/Header";

export default function Home() {
    const router = useRouter();
    const [showSellerModal, setShowSellerModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerRole, setRegisterRole] = useState<'customer' | 'vendor'>('customer');

    const handleBecomeSeller = () => {
        setRegisterRole('vendor');
        setShowRegisterModal(true);
    };

    const handleJoinCommunity = () => {
        setRegisterRole('customer');
        setShowRegisterModal(true);
    };

    const handleRegisterComplete = () => {
        setShowRegisterModal(false);
        router.push('/products');
    };

    return (
        <div className="min-h-screen flex flex-col bg-black font-sans">
            <Header />
            <main>
                <HeroSection
                    onBecomeSeller={handleBecomeSeller}
                    onJoinCommunity={handleJoinCommunity}
                />
                <TestimonialsAndPress onJoinCommunity={handleJoinCommunity} />
                <ProblemStatement />
                <SolutionSection />
                <FeaturesSection />
                <HowItWorks />
            </main>
            <Footer />
            <SellerModal show={showSellerModal} onClose={() => setShowSellerModal(false)} />
            <RegisterModal
                show={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                initialRole={registerRole}
                onRegisterComplete={handleRegisterComplete}
            />
        </div>
    );
}
