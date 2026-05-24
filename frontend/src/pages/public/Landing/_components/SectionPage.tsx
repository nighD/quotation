import React from "react";

interface SectionPageProps {
    id?: string;
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export const SectionPage = ({
    id,
    children,
    className = "",
    containerClassName = "",
}: SectionPageProps) => {
    const maxWidthClass = containerClassName.includes("max-w-") ? "" : "max-w-[1400px]";
    return (
        <section
            id={id}
            className={`relative w-full bg-black py-10 md:py-20 px-6 md:px-20 overflow-hidden ${className}`}
        >
            <div className={`${maxWidthClass} mx-auto w-full ${containerClassName}`}>
                {children}
            </div>
        </section>
    );
};
