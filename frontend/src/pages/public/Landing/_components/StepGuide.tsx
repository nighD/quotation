"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SectionPage } from "./SectionPage";

const steps = [
    {
        id: "01",
        title: "Seamless Signup",
        description: "Create your account and submit your application",
        tilt: "lg:rotate-y-[35deg] lg:rotate-x-[5deg]",
    },
    {
        id: "02",
        title: "Instant Pass Activation",
        description: "Complete payment and activate your pass instantly.",
        tilt: "rotate-0",
    },
    {
        id: "03",
        title: "Unlock Exclusive Benefits",
        description: "Explore premium insights and investment opportunities.",
        tilt: "lg:rotate-y-[-35deg] lg:rotate-x-[5deg]",
    },
];

export const StepGuide = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <SectionPage id="how-it-works" containerClassName="flex flex-col items-center">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-fraunces text-3xl md:text-5xl text-white text-center leading-tight max-w-[700px] mb-12"
            >
                Start using VIFC Pass
            </motion.h2>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative py-4"
            >
                <img
                    src="/image/card-center.png"
                    alt="VIFC Pass Central"
                    className="object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,0.9)] w-[400px] h-[500px]"
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full md:pt-2 pt-8 perspective-2000">
                {steps.map((step, index) => {
                    const isActive = activeIndex === index;

                    return (
                        <div
                            key={step.id}
                            onClick={() => setActiveIndex(index)}
                            className={`relative cursor-pointer transition-all duration-700 preserve-3d ${step.tilt}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeStepBg"
                                    className="absolute inset-0 bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-2xl z-0"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className="relative py-4 px-8 z-10 flex flex-col items-start">
                                <div className="mb-4 w-6 h-6 relative">
                                    <img
                                        src="/image/icon-step.png"
                                        alt="Step Icon"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                </div>

                                <div className={`px-2 py-0.5 rounded-full border mb-2 transition-colors duration-500 ${isActive ? "border-white/20 bg-white/5" : "border-white/10"}`}>
                                    <span className={`text-[10px] font-normal! tracking-widest transition-colors duration-500 ${isActive ? "text-white" : "text-white/40"}`}>
                                        Step {step.id}
                                    </span>
                                </div>

                                <h3 className={`font-medium font-fraunces text-3xl leading-tight mb-2 transition-colors duration-500 ${isActive ? "text-white" : "text-white/60"}`}>
                                    {step.title}
                                </h3>
                                <p className={`text-sm leading-relaxed max-w-[300px] transition-colors duration-500 ${isActive ? "text-white/60" : "text-white/30"}`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .perspective-2000 {
                    perspective: 2000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
            `}</style>
        </SectionPage>
    );
};
