"use client";

import { HeroContent } from "./HeroContent";

export const HeroBanner = () => {
    return (
        <section className="relative w-full py-20 overflow-hidden bg-black flex flex-col items-center justify-center">
            <div className="absolute inset-0 z-0">
                <img
                    src="/banner/banner-home.png"
                    alt="VIFC Hero Banner"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                />
            </div>

            <div className="absolute inset-0 z-10 bg-linear-to-t from-black via-black/40 to-transparent opacity-90" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

            <HeroContent />

            <style>{`
                .perspective-2000 {
                    perspective: 2000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
            `}</style>
        </section>
    );
};
