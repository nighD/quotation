"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SectionPage } from "./SectionPage";

const faqData = [
    {
        question: "What is VIFC Privilege Pass?",
        answer: "VIFC Privilege Pass is a premium investor membership powered by GOE Alliance.",
    },
    {
        question: "Why is VIFC Privilege Pass important for investors?",
        answer: "VPP helps investors better understand the VIFC ecosystem through trusted information, strategic connections, and curated opportunities within Vietnam’s emerging financial market.",
    },
    {
        question: "Who is eligible to join?",
        answer: "VPP is designed for qualified investors, business leaders, founders, family offices, and global entrepreneurs interested in opportunities within VIFC and Vietnam’s emerging financial ecosystem.",
    },
    {
        question: "How do I get started?",
        answer: "Sign up, activate your pass, and unlock exclusive benefits.",
    },
];

export const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <SectionPage id="faq" className="relative w-full py-20 md:pt-22 md:pb-10! pb-20 px-6 md:px-20 overflow-hidden bg-black min-h-[400px] flex flex-col items-center justify-center" containerClassName=" flex flex-col items-center">

            <div className="absolute inset-0 z-0">
                <img
                    src="/banner/banner-faq2.png"
                    alt="FAQ Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            <div className="absolute bottom-0 -right-10 md:-bottom-10 md:-right-10 w-[250px] md:w-[500px] aspect-square pointer-events-none z-0">
                <img
                    src="/image/icon-partner01.png"
                    alt="Decor Icon"
                    className="absolute inset-0 w-full h-full object-contain object-bottom"
                />
            </div>

            <div className="relative z-10 w-full mx-auto flex-1 flex flex-col justify-center ">
                <div className="space-y-3">
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className={`rounded-[12px] max-w-200 mx-auto transition-all duration-500 border backdrop-blur-md ${isOpen ? "bg-[#252525]/90 border-white/10" : "bg-[#1a1a1a]/40 border-white/5"
                                    } overflow-hidden`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full px-6 py-4 cursor-pointer  md:py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className={`font-fraunces text-md md:text-xl transition-colors duration-500 ${isOpen ? "text-white" : "text-white/80"
                                        }`}>
                                        {item.question}
                                    </span>
                                    <div className={`transition-transform duration-500 flex items-center justify-center w-5 h-5 ${isOpen ? "rotate-0 text-white/60" : "-rotate-90 text-white/40"}`}>
                                        <ChevronDown size={16} />
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <div className="px-6 pb-6 pt-1 text-white/40 text-[13px] md:text-[14px] leading-relaxed font-light">
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-40 w-full flex flex-col">
                    <div className="w-full flex flex-col md:flex-row relative z-20 gap-20">
                        <div className="w-fit flex flex-col space-y-3">
                            <span className="text-white/50 text-[13px] md:text-[14px] font-light">Contact</span>
                            <div className="flex flex-col space-y-2">
                                <span className="text-white text-[15px] md:text-[16px] tracking-wide">(+84) 964 93 1661</span>
                                <span className="text-white/80 text-[14px] md:text-[15px] font-light">partner@goealliance.org</span>
                            </div>
                        </div>

                        <div className="w-fit flex flex-col space-y-3 md:ml-40 ml-0">
                            <span className="text-white/50 text-[13px] md:text-[14px] font-light">Address</span>
                            <div className="flex flex-col space-y-2">
                                <span className="text-white text-[15px] md:text-[16px] tracking-wide">GOE Alliance Office</span>
                                <span className="text-white/80 text-[14px] md:text-[15px] font-light leading-relaxed">IFC Building, 8 Nguyen Hue Street, Saigon Ward, Ho Chi Minh City</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SectionPage>
    );
};
