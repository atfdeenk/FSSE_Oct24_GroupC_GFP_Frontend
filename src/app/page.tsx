"use client";
import "./globals.css";
import "./animations.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Import components using the centralized exports
import {
    Header,
    Footer,
    HeroSection,
    RegisterModal,
    SellerModal,
    TestimonialsAndPress,
    ProblemStatement,
    SolutionSection,
    FeaturesSection,
    HowItWorks
} from "@/components";

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
