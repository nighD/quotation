"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";

export const HeroContent = () => {
    const navigate = useNavigate();

    const handleAuthRedirect = (path: string) => {
        const isProd = import.meta.env.PROD;
        if (isProd) {
            window.location.href = `https://dashboard.vifcpass.com${path}`;
        } else {
            navigate(path);
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [25, -25]), { stiffness: 50, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-25, 25]), { stiffness: 50, damping: 20 });

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative z-20 w-full max-w-[1400px] mx-auto px-6 flex flex-col items-center"
        >
            <div className="relative w-full flex flex-col items-center my-10 md:my-22 perspective-2000">
                <div className="w-full text-center pointer-events-none select-none">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="font-serif text-[48px] sm:text-[80px] md:text-[120px] lg:text-[160px] leading-[1.05] text-white tracking-tight"
                    >
                        The Gateway <br />
                        <div className="flex justify-center md:justify-between w-full max-w-[850px] mx-auto mt-[-5px] md:mt-[-40px] gap-4 md:gap-0">
                            <span>to</span>
                            <span>VIFC</span>
                        </div>
                    </motion.h1>
                </div>

                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d"
                    }}
                    initial={{ opacity: 0, scale: 0.2, rotateZ: 180, y: 100 }}
                    animate={{ opacity: 1, scale: 1, rotateZ: isMobile ? 12 : -18, y: 0 }}
                    transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.3 }}
                    className="absolute top-[105%] md:top-full left-1/2 md:left-[40%] -translate-x-1/2 md:-translate-y-1/2 w-[90vw] max-w-[340px] sm:max-w-[350px] md:w-[450px] md:max-w-none lg:w-[550px] aspect-[1.6/1] z-30 group cursor-pointer"
                >
                    <div className="relative w-full h-full transform-gpu preserve-3d">
                        <div className="relative w-full h-full z-0 overflow-hidden rounded-[20px] md:rounded-[30px]">
                            <img
                                src="/image/card.png"
                                alt="VIFC Pass Card"
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            />
                        </div>

                        <motion.div
                            style={{
                                translateZ: -40,
                                opacity: useTransform(rotateX, [-25, 25], [0.3, 0.6])
                            }}
                            className="absolute inset-5 bg-black blur-2xl md:blur-[60px] rounded-full z-[-1]"
                        />
                    </div>
                </motion.div>
            </div>

            <div className="w-full max-w-[750px] mx-auto text-center mt-[240px] sm:mt-[260px] md:mt-36 space-y-8 md:space-y-10 px-2 md:px-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                    className="flex items-center justify-center gap-3 w-full"
                >
                    <Button onClick={() => handleAuthRedirect('/login')} label="Explore VIFC Pass" variant="white" className=" w-fit! whitespace-nowrap px-4! py-3.5 md:py-4 rounded-[12px] md:rounded-[16px] text-[13px] md:text-base" />
                </motion.div>
            </div>
        </div>
    );
};
