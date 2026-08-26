import React from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export interface CloseButtonProps {
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "luxury" | "dark" | "light" | "ghost";
  ariaLabel?: string;
  disabled?: boolean;
}

const sizeConfig = {
  sm: {
    button: "w-7 h-7 sm:w-8 sm:h-8 rounded-xl",
    icon: 14,
    blur: "rounded-xl",
  },
  md: {
    button: "w-9 h-9 sm:w-10 sm:h-10 rounded-2xl",
    icon: 18,
    blur: "rounded-2xl",
  },
  lg: {
    button: "w-11 h-11 sm:w-12 sm:h-12 rounded-[20px]",
    icon: 20,
    blur: "rounded-[20px]",
  },
};

const variantConfig = {
  luxury: {
    base: "bg-[#F0E4D8]/80 text-[#523C37] border border-[#E4D6CA] shadow-xs backdrop-blur-xs hover:bg-[#EADCCF] hover:text-[#1B1A16] hover:border-[#D6C5B5] hover:shadow-md",
    glow: "bg-linear-to-tr from-[#B58F6F]/25 via-[#E09A30]/15 to-white/40",
    icon: "text-[#664E48] group-hover:text-[#1B1A16]",
  },
  dark: {
    base: "bg-black/50 text-white/90 border border-white/20 shadow-sm backdrop-blur-md hover:bg-black/75 hover:text-white hover:border-white/35 hover:shadow-lg",
    glow: "bg-linear-to-tr from-white/20 via-white/10 to-transparent",
    icon: "text-white/80 group-hover:text-white",
  },
  light: {
    base: "bg-white/80 text-[#523C37] border border-[#E4D6CA]/70 shadow-xs backdrop-blur-md hover:bg-white hover:text-[#1B1A16] hover:border-[#D6C5B5] hover:shadow-md",
    glow: "bg-linear-to-tr from-[#B58F6F]/15 via-amber-200/20 to-white/60",
    icon: "text-[#664E48] group-hover:text-[#1B1A16]",
  },
  ghost: {
    base: "bg-transparent text-[#523C37] hover:bg-[#EADCCF]/60 hover:text-[#1B1A16]",
    glow: "bg-transparent",
    icon: "text-[#664E48] group-hover:text-[#1B1A16]",
  },
};

export const CloseButtonCustom: React.FC<CloseButtonProps> = ({
  onClick,
  className = "",
  iconClassName = "",
  size = "md",
  variant = "luxury",
  ariaLabel = "Đóng",
  disabled = false,
}) => {
  const currentSize = sizeConfig[size] || sizeConfig.md;
  const currentVariant = variantConfig[variant] || variantConfig.luxury;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "group relative flex items-center justify-center transition-all duration-300 select-none cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B58F6F]/60 focus-visible:ring-offset-2",
        "active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        currentSize.button,
        currentVariant.base,
        className,
      )}
    >
      {/* Ambient gradient glow on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xs",
          currentSize.blur,
          currentVariant.glow,
        )}
      />

      {/* Rotating X Icon */}
      <X
        size={currentSize.icon}
        strokeWidth={2.5}
        className={cn(
          "relative z-10 transition-transform duration-500 ease-out group-hover:rotate-90",
          currentVariant.icon,
          iconClassName,
        )}
      />
    </button>
  );
};

export const CloseButton = CloseButtonCustom;
