"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionPage } from "./SectionPage";
import { Check, Key } from "lucide-react";

const plans = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        duration: "Time: 1 year",
        features: ["Dashboard", "Newsletter", "Light report", "Webinar"],
        icon: "/image/icon-subscription01.png",
    },
    {
        id: "base",
        name: "Base",
        price: "$1",
        duration: "Time: 1 year",
        features: ["Dashboard", "Newsletter", "Light report", "Webinar"],
        icon: "/image/icon-subscription01.png",
    },
    {
        id: "standard",
        name: "Standard",
        price: "$500",
        duration: "Time: 1 year",
        features: ["Dashboard", "Newsletter", "Webinar", "Full report", "Exclusive Event"],
        isPopular: true,
        icon: "/image/icon-subscription02.png",
    },
    {
        id: "premium",
        name: "Premium",
        price: "$2500",
        duration: null,
        features: ["Waiting list"],
        isWaitingList: true,
        icon: "/image/icon-subscription02.png",
    }
];

export const SubscriptionSection = () => {
    const [activePlan, setActivePlan] = useState("standard");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <SectionPage id="subscription" className="bg-black" containerClassName="flex justify-center">
            <div className="relative w-full max-w-[1400px] bg-linear-to-b from-[#0c0c0c] via-[#050505] to-transparent rounded-[40px] md:rounded-[56px] p-6 md:p-10 lg:p-12 ">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/2 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="flex flex-col items-center mb-12 lg:mb-16 text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-fraunces text-4xl md:text-5xl text-white leading-tight mb-4 tracking-tight">
                        Subscription
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full items-stretch max-w-full mx-auto relative z-10">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            layout
                            onClick={() => setActivePlan(plan.id)}
                            animate={{ scale: activePlan === plan.id && !isMobile ? 1.05 : 1 }}
                            whileHover={{ scale: activePlan === plan.id && !isMobile ? 1.05 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`relative rounded-[32px] border flex flex-col shadow-lg h-full cursor-pointer transition-all duration-500 p-8 pb-10 ${
                                activePlan === plan.id 
                                    ? "border-white/20 bg-[#2a2a2a] z-20 shadow-2xl" 
                                    : "border-white/5 bg-[#141414] z-10"
                            }`}
                        >
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
                                <div className={`absolute -bottom-10 right-0 w-[200px] md:w-[240px] aspect-square pointer-events-none transition-all duration-500 ${activePlan === plan.id ? 'opacity-80 scale-110' : 'opacity-40'}`}>
                                    <img
                                        src={plan.icon}
                                        alt={`${plan.name} Decor`}
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="h-[32px] mb-2 flex items-center">
                                    {plan.isPopular && (
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white md:text-[12px] text-[13px] font-medium backdrop-blur-md">
                                            Most Popular
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-serif text-[28px] md:text-[36px] tracking-wide text-white font-fraunces mb-2">
                                    {plan.name}
                                </h3>
                                <div className="text-[36px] md:text-[44px] font-bold text-white leading-none mb-3">
                                    {plan.price}
                                </div>
                                
                                {plan.duration ? (
                                    <div className="text-white/60 text-[14px] md:text-[15px] mb-6">{plan.duration}</div>
                                ) : (
                                    <div className="h-[21px] mb-6"></div>
                                )}

                                <div className="w-full h-px bg-white/10 mb-8"></div>

                                <div className="flex flex-col gap-4 flex-grow relative z-20">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-white/90 text-[14px] md:text-[15px]">
                                            {plan.isWaitingList ? (
                                                <Key className="w-[18px] h-[18px] text-white/60 shrink-0" />
                                            ) : (
                                                <Check className="w-[18px] h-[18px] text-white shrink-0" />
                                            )}
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {activePlan === plan.id && (
                                <motion.div
                                    layoutId="exploreButton"
                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30"
                                >
                                    <button className="px-6 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:bg-gray-200 transition-colors whitespace-nowrap">
                                        Explore Membership
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </SectionPage>
    );
};
