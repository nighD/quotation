"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SectionPage } from "./SectionPage";

const perks = [
    { id: 3, title: "Privileged Information Access", description: "Premium reports, member dashboard access, and exclusive events", image: "/image/benifits3-pia.png" },
    { id: 2, title: "GOE Ecosystem Benefits", description: "Curated investment opportunities and ecosystem partnerships", image: "/image/benifits-goe.png" },
    { id: 1, title: "VIFC Policy Access", description: "Policy-enabled benefits, official updates, and strategic partnerships.", image: "/image/benifits-vifc.png" },
];

export const BenefitsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => setActiveIndex((prev) => (prev + 1) % perks.length);
    const prevSlide = () => setActiveIndex((prev) => (prev - 1 + perks.length) % perks.length);

    return (
        <SectionPage id="benefits" className="py-4 md:py-32 select-none" containerClassName="max-w-[1300px]">
            <div className="flex flex-col items-center mb-14 text-center">
                <h2 className="font-fraunces text-4xl md:text-5xl text-white leading-tight mb-4 tracking-tight">
                    Benefits
                </h2>
            </div>

            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">

                <div className="flex flex-col space-y-4">
                    {perks.map((perk, index) => {
                        const isActive = activeIndex === index;
                        return (
                            <div
                                key={perk.id}
                                onClick={() => setActiveIndex(index)}
                                className="relative px-6 py-3 cursor-pointer group"
                            >
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeBox"
                                            className="absolute inset-0 rounded-xl border border-white/10 border-t-0 bg-white/2 shadow-2xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="relative z-10">
                                    <h3 className={`text-2xl md:text-[28px] font-serif tracking-tight transition-all duration-700 ${isActive ? "text-white" : "text-white/20"}`}>
                                        {perk.title}
                                    </h3>
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: isActive ? "auto" : 0,
                                            opacity: isActive ? 1 : 0,
                                            marginTop: isActive ? 12 : 0
                                        }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-white/40 text-[15px] leading-relaxed max-w-[500px] font-light">
                                            {perk.description}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="relative flex items-center justify-center h-[350px] sm:h-[450px] lg:h-[500px]">
                    <div className="relative w-full max-w-[400px] aspect-square">
                        <AnimatePresence mode="popLayout">
                            {perks.map((perk, index) => {
                                let x = 0;
                                let y = 0;
                                let scale = 1;
                                let zIndex = 10;
                                let opacity = 1;

                                const isActive = index === activeIndex;
                                const isPrev = index === (activeIndex - 1 + perks.length) % perks.length;
                                const isNext = index === (activeIndex + 1) % perks.length;

                                if (activeIndex === 2) {
                                    let displayIndex = (index - activeIndex + perks.length) % perks.length;
                                    if (displayIndex > 2) return null;

                                    y = displayIndex * -40;
                                    x = displayIndex * 0;
                                    scale = 1 - displayIndex * 0.05;
                                    zIndex = 10 - displayIndex;
                                    opacity = 1 - displayIndex * 0.25;
                                } else {
                                    if (isActive) {
                                        x = 0; y = 0; scale = 1; zIndex = 10; opacity = 1;
                                    } else if (isPrev) {
                                        x = 80; y = -70; scale = 0.75; zIndex = 5; opacity = 0.7;
                                    } else if (isNext) {
                                        x = -80; y = 70; scale = 0.75; zIndex = 5; opacity = 0.7;
                                    } else {
                                        return null;
                                    }
                                }

                                return (
                                    <motion.div
                                        key={perk.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{
                                            x,
                                            y,
                                            scale,
                                            opacity,
                                            zIndex,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.85,
                                            transition: { duration: 0.4 }
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                            mass: 1.2,
                                        }}
                                        className="absolute inset-0 bg-[#0d0f14] rounded-[48px] md:rounded-[56px] border border-white/10 shadow-[0_60px_100px_rgba(0,0,0,0.9)] overflow-hidden"
                                    >
                                        <div className="absolute inset-0 rounded-[48px] md:rounded-[56px] border-t-2 border-pink-500/20 pointer-events-none z-10" />
                                        <img
                                            src={perk.image}
                                            alt={`Benefit ${perk.id}`}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <div className="absolute -inset-10 md:-inset-20 bg-pink-600/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />
                    </div>
                </div>
            </div>

            <div className="hidden md:flex justify-center items-center gap-6 mt-10">
                <button onClick={prevSlide} className="cursor-pointer text-white/50 hover:text-white hover:border-white/40 transition-all active:scale-90">
                    <ArrowLeft size={36} />
                </button>
                <button onClick={nextSlide} className="cursor-pointer text-white/50 hover:text-white hover:border-white/40 transition-all active:scale-90">
                    <ArrowRight size={36} />
                </button>
            </div>

            <div className="flex md:hidden flex-col space-y-20 mt-8">
                {perks.map((perk, index) => {
                    return (
                        <div key={perk.id} className="flex flex-col items-center text-center space-y-8">
                            <div className="relative w-70 aspect-square rounded-[40px] bg-[#0d0f14] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                                <div className="absolute inset-0 rounded-[40px] border-t-2 border-pink-500/20 pointer-events-none z-10" />
                                <img
                                    src={perk.image}
                                    alt={`Benefit ${perk.id}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>

                            <div className="px-4 flex flex-col items-center max-w-100">
                                <h3 className="text-2xl font-serif tracking-tight text-white mb-3">
                                    {perk.title}
                                </h3>
                                <p className="text-white/40 text-[15px] leading-relaxed font-light">
                                    {perk.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </SectionPage >
    );
};