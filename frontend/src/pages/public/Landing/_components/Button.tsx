"use client";


interface ButtonProps {
    label: string;
    onClick?: () => void;
    variant?: "white" | "glass";
    className?: string;
}

export const Button = ({
    label,
    onClick,
    variant = "white",
    className = "",
}: ButtonProps) => {
    const styles = {
        white: {
            container: "bg-white text-[#111111] border-transparent",
            hoverBg: "bg-black",
            hoverText: "group-hover:text-white",
            hoverBorder: "group-hover:border-black",
        },
        glass: {
            container: "bg-[#2d2d2d] text-white border-white/10",
            hoverBg: "bg-white",
            hoverText: "group-hover:text-black",
            hoverBorder: "group-hover:border-white",
        },
    };

    const currentStyle = styles[variant];

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden cursor-pointer rounded-2xl px-10 py-4 font-medium text-base transition-all duration-500 active:scale-95 outline-none border ${currentStyle.container} ${currentStyle.hoverBorder} ${className}`}
        >
            <div className={`absolute inset-0 translate-y-[101%] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 ${currentStyle.hoverBg}`} />
            <span className={`relative z-10 transition-colors duration-500 ${currentStyle.hoverText}`}>
                {label}
            </span>
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-10 duration-700 bg-linear-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform ease-in-out" />
        </button>
    );
};
