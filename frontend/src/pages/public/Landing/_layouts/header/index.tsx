"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [
    { name: "Introduce", href: "#introduce" },
    { name: "Benefits", href: "#benefits" },
    { name: "Subscription", href: "#subscription" },
    { name: "FAQ", href: "#faq" },
];

export const Header = () => {
    const navigate = useNavigate();

    const handleAuthRedirect = (path: string) => {
        const isProd = import.meta.env.PROD;
        if (isProd) {
            window.location.href = `https://dashboard.vifcpass.com${path}`;
        } else {
            navigate(path);
        }
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const handleScrollSpy = () => {
            let current = "";
            const threshold = window.innerHeight * 0.4;

            for (const link of navLinks) {
                const section = document.getElementById(link.href.replace("#", ""));
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= threshold) {
                        current = link.href;
                    }
                }
            }

            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
                current = navLinks[navLinks.length - 1].href;
            }

            setActiveSection(current);
        };

        window.addEventListener("scroll", handleScrollSpy);
        handleScrollSpy();

        return () => window.removeEventListener("scroll", handleScrollSpy);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isMenuOpen]);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            setIsMenuOpen(false);

            setTimeout(() => {
                const targetId = href.replace("#", "");
                const elem = document.getElementById(targetId);
                if (elem) {
                    const headerOffset = 80;
                    const elementPosition = elem.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 100);
        } else {
            setIsMenuOpen(false);
        }
    };

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 pointer-events-none"
        >
            <div className="max-w-[1400px] relative pointer-events-auto bg-[#1c1c1c]/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-white/10 md:border-none rounded-full md:rounded-none px-6 py-3 md:p-0 mx-auto flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <a
                        href="/"
                        className="w-12 md:w-14 font-bold tracking-tight text-white flex items-center z-50 hover:scale-110 transition-transform duration-300"
                    >
                        <img
                            src="/image/logo.png"
                            alt="VIFC"
                            className="object-contain w-full h-auto"
                        />
                    </a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: "-100%", x: "-50%" }}
                    animate={{ opacity: 1, y: "-50%", x: "-50%" }}
                    transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:flex items-center gap-8 bg-black/40 backdrop-blur-3xl border border-white/10 p-1.5 rounded-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] absolute left-1/2 top-1/2"
                >
                    <nav className="flex items-center gap-1">
                        {navLinks.map((link, index) => (
                            <motion.div
                                key={link.name}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            >
                                <a
                                    href={link.href}
                                    onClick={(e) => handleScroll(e as any, link.href)}
                                    className={`text-[14px] font-medium px-6 py-2.5 rounded-full transition-all duration-300 group relative overflow-hidden flex ${activeSection === link.href
                                        ? "text-white bg-white/10"
                                        : "text-white/80 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    <span className="relative z-10">{link.name}</span>
                                    <span className={`absolute inset-0 bg-white/5 transition-opacity duration-300 rounded-full blur-sm ${activeSection === link.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                        }`} />
                                </a>
                            </motion.div>
                        ))}
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
                    >
                        <a
                            href="#subscription"
                            onClick={(e) => { e.preventDefault(); handleAuthRedirect('/login'); }}
                            className="bg-white text-black text-[14px] font-bold px-6 py-2.5 rounded-full hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95 whitespace-nowrap block hover:-translate-y-0.5"
                        >
                            Explore VIFC Pass
                        </a>
                    </motion.div>
                </motion.div>

                <div className="flex items-center lg:hidden z-50">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors relative flex items-center justify-center w-10 h-10"
                    >
                        <AnimatePresence mode="wait">
                            {isMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute"
                                >
                                    <X size={24} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, rotate: 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute"
                                >
                                    <Menu size={24} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden pointer-events-auto"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[80%] max-w-[400px] bg-[#050505] border-l border-white/10 z-50 lg:hidden flex flex-col p-10 pt-32 pointer-events-auto"
                        >
                            <nav className="flex flex-col gap-8">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.1 }}
                                    >
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleScroll(e as any, link.href)}
                                            className={`text-3xl font-serif transition-colors flex ${activeSection === link.href ? "text-white" : "text-white/60 hover:text-white"
                                                }`}
                                        >
                                            {link.name}
                                        </a>
                                    </motion.div>
                                ))}
                            </nav>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-auto"
                            >
                                <a
                                    href="#subscription"
                                    onClick={(e) => { e.preventDefault(); handleAuthRedirect('/login'); }}
                                    className="w-full block text-center bg-white text-black text-[16px] font-bold py-5 rounded-2xl hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                >
                                    Explore VIFC Pass
                                </a>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
};
