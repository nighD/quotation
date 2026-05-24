"use client";

import { motion } from "framer-motion";
import { SectionPage } from "./SectionPage";

export const CardFeature = () => {
    return (
        <SectionPage id="introduce" className="border-t border-white/5 py-10" containerClassName="max-w-[1200px] flex flex-col-reverse lg:flex-row items-center justify-between gap-6 lg:gap-12">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="items-end flex justify-end"
            >
                <img
                    src="/image/card-center.png"
                    alt="VIFC Pass Feature"
                    className="object-contain drop-shadow-[0_30px_100px_rgba(0,0,0,0.9)] w-[500px] h-[500px]"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="w-full lg:w-[50%] text-left"
            >
                <h2 className="font-fraunces text-3xl sm:text-4xl md:text-[40px] lg:text-3xl font-medium leading-[1.1] text-[#F8F8F8] tracking-normal">
                    An exclusive pass for <br className="hidden md:block" />
                    qualified investors, providing <br className="hidden md:block" />
                    access to premium insight <br className="hidden md:block" />
                    reports, curated investment <br className="hidden md:block" />
                    opportunities, and strategic <br className="hidden md:block" />
                    relationships within the <br className="hidden md:block" />
                    VIFC ecosystem.
                </h2>
            </motion.div>
        </SectionPage>
    );
};
