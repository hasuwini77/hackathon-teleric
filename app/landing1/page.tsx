"use client";

import StylishBackground from "@/components/landing/StylishBackground";
import CustomCursor from "@/components/landing/CustomCursor";
import "./landing.css";

const LandingPage = () => {
    return (
        <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center cursor-none">
            {/* Custom Cursor */}
            <CustomCursor />

            {/* 3D Interactive Background */}
            <StylishBackground />

            {/* Immersive Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-950/30" />

            {/* Center Content */}
            <div className="relative z-10 text-center flex flex-col items-center gap-6 px-6">
                <div className="alternate-glow" />
                
                <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
                    <div className="relative inline-block">
                        <h1 className="text-7xl md:text-9xl font-bold alternate-title select-none">
                            SKYE
                        </h1>
                        <span className="absolute -top-2 -right-6 text-xl font-light text-blue-400 opacity-50">®</span>
                    </div>
                </div>
                
                <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
                    <p className="text-lg md:text-2xl font-light text-slate-300 tracking-[0.3em] uppercase opacity-70">
                        Your Tailored course made with AI
                    </p>
                </div>

                {/* Subtle refined accent */}
                <div className="mt-8 h-[2px] w-32 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>

            {/* CSS Vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
        </main>
    );
};

export default LandingPage;