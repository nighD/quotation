import React from "react";
import { cn } from "../utils/cn";

export interface SectionHeaderModalProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const SectionHeaderModal: React.FC<SectionHeaderModalProps> = ({
  title,
  subtitle,
  description,
  icon,
  badge,
  children,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}) => {
  return (
    <div className={cn("w-full flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Optional Icon/Badge visual container */}
        {icon && (
          <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#F0E4D8] border border-[#E6D7CB] text-[#8C6246] flex items-center justify-center shadow-xs">
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {badge && (
            <div className="mb-1.5">
              {typeof badge === "string" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EADCCF] text-[#8C6246] text-[10.5px] sm:text-[11px] font-['Inter'] font-semibold uppercase tracking-wider">
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}

          {title && (
            <h3
              className={cn(
                "text-[22px] sm:text-[26px] md:text-[28px] font-['Cormorant_Garamond'] font-semibold text-[#1B1A16] leading-snug tracking-tight",
                titleClassName,
              )}
            >
              {title}
            </h3>
          )}

          {subtitle && (
            <p className="mt-0.5 text-[11px] sm:text-[12px] font-['Inter'] font-semibold uppercase tracking-widest text-[#B58F6F]">
              {subtitle}
            </p>
          )}

          {description && (
            <p
              className={cn(
                "mt-1 text-[12px] sm:text-[13px] font-['Inter'] text-[#664E48] leading-relaxed",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right side slot: Header extras / Close Button */}
      {children && (
        <div className="flex items-center gap-2.5 shrink-0 ml-auto pt-0.5">
          {children}
        </div>
      )}
    </div>
  );
};
