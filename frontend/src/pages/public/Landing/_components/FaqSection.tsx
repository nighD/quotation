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

              <div className="mt-16 md:mt-32 lg:mt-40 w-full flex flex-col">
                    <div className="w-full flex flex-col md:flex-row relative z-20 gap-8 md:gap-12 lg:gap-20">
                        <div className="w-full md:w-fit flex flex-col space-y-2 md:space-y-3">
                            <span className="text-white/50 text-[13px] md:text-[14px] font-light">Contact</span>
                            <div className="flex flex-col space-y-1 md:space-y-2">
                                <span className="text-white text-[15px] md:text-[16px] tracking-wide">(+84) 987 23 2540</span>
                                <span className="text-white/80 text-[14px] md:text-[15px] font-light break-words">vpp@goealliance.org</span>
                            </div>
                        </div>

                        <div className="w-full md:w-fit flex flex-col space-y-2 md:space-y-3 md:ml-10 lg:ml-40 ml-0">
                            <span className="text-white/50 text-[13px] md:text-[14px] font-light">Address</span>
                            <div className="flex flex-col space-y-1 md:space-y-2">
                                <span className="text-white text-[15px] md:text-[16px] tracking-wide">GOE Alliance Office</span>
                                <span className="text-white/80 text-[14px] md:text-[15px] font-light leading-relaxed">L17-11, 17th Floor, Vincom Center Building, 72 Le Thanh Ton Street, Saigon Ward, Ho Chi Minh City, Vietnam.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 md:mt-20 w-full flex flex-col items-center text-center">
                    <div className="w-full flex flex-col relative z-20 items-center">
                        <div className="w-fit flex flex-col space-y-3 items-center">
                            <span className="text-white text-[16px] md:text-[18px] font-medium">VPP Privillege Pass Powered by GOE Alliance</span>
                            <div className="flex flex-col space-y-2 mt-2 items-center">
                                <span className="text-white/80 text-xs font-light leading-relaxed">
                                    CÔNG TY TNHH KINH TẾ ON-CHAIN TOÀN CẦU - MSDN: 0319453163. <br className="hidden md:block" />
                                    Địa chỉ trụ sở chính: L17-11, Tầng 17, Tòa nhà Vincom Center, 72 Lê Thánh Tôn, Phường Sài Gòn, Thành phố Hồ Chí Minh, Việt Nam. <br className="hidden md:block" />
                                    Điện thoại : 0987.232.540.  Email : vpp@goealliance.org
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SectionPage>
    );
};
