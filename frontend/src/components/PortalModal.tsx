import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { CloseButtonCustom, CloseButton, type CloseButtonProps } from "./CloseButtonCustom";
import { SectionHeaderModal, type SectionHeaderModalProps } from "./SectionHeaderModal";

export type ModalTheme = "luxury" | "dark" | "light" | "plain";

export interface IPortalModal {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerExtra?: React.ReactNode;
  header?: React.ReactNode; // Complete header override if needed
  footer?: React.ReactNode;
  banner?: React.ReactNode; // Optional top banner image / element
  width?: string;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  preventCloseOnClickOverlay?: boolean;
  closeOnBackdropClick?: boolean; // Backward compatibility alias
  preventCloseOnEsc?: boolean;
  noPadding?: boolean;
  showCloseButton?: boolean;
  theme?: ModalTheme;
}

export type PortalModalProps = IPortalModal;

const themeCardStyles: Record<ModalTheme, string> = {
  luxury: "bg-[#F8F1EA] text-[#1B1A16] border border-[#E4D6CA] shadow-2xl",
  dark: "bg-[#18181B] text-white border border-white/10 shadow-2xl",
  light: "bg-white text-[#1B1A16] border border-gray-100 shadow-2xl",
  plain: "bg-transparent text-inherit border-0 shadow-none",
};

const themeHeaderStyles: Record<ModalTheme, string> = {
  luxury: "bg-[#F8F1EA]/95 border-b border-[#E4D6CA]/70 text-[#1B1A16]",
  dark: "bg-[#18181B]/95 border-b border-white/10 text-white",
  light: "bg-white/95 border-b border-gray-100 text-[#1B1A16]",
  plain: "bg-transparent border-0 text-inherit",
};

const themeFooterStyles: Record<ModalTheme, string> = {
  luxury: "bg-[#F0E4D8]/90 border-t border-[#E4D6CA] text-[#523C37]",
  dark: "bg-[#202024]/90 border-t border-white/10 text-gray-200",
  light: "bg-gray-50/90 border-t border-gray-100 text-gray-700",
  plain: "bg-transparent border-0 text-inherit",
};

export const PortalModal: React.FC<IPortalModal> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  description,
  icon,
  badge,
  headerExtra,
  header,
  footer,
  banner,
  width = "max-w-lg",
  className = "",
  containerClassName = "items-center justify-center p-3.5 sm:p-5 md:p-6",
  contentClassName = "",
  preventCloseOnClickOverlay = false,
  closeOnBackdropClick = true,
  preventCloseOnEsc = false,
  noPadding = false,
  showCloseButton = true,
  theme = "luxury",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Body scroll lock management
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard Escape listener
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && !preventCloseOnEsc && isOpen) {
        event.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose, preventCloseOnEsc],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!mounted || typeof document === "undefined") return null;

  const canCloseOnOverlay = !preventCloseOnClickOverlay && closeOnBackdropClick;
  const hasHeaderContent = header || title || description || subtitle || icon || badge || headerExtra || showCloseButton;
  const cardThemeClass = themeCardStyles[theme] || themeCardStyles.luxury;
  const headerThemeClass = themeHeaderStyles[theme] || themeHeaderStyles.luxury;
  const footerThemeClass = themeFooterStyles[theme] || themeFooterStyles.luxury;

  const closeButtonVariant = theme === "dark" ? "dark" : theme === "light" ? "light" : "luxury";

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex overflow-hidden pointer-events-auto",
            containerClassName,
          )}
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
            onClick={() => canCloseOnOverlay && onClose()}
            aria-hidden="true"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative w-full flex flex-col overflow-hidden isolate my-auto",
              "max-h-[min(90vh,calc(100dvh-2.5rem))]",
              !className.includes("rounded-") && "rounded-3xl sm:rounded-[28px]",
              width,
              cardThemeClass,
              className,
            )}
          >
            {/* Top Banner (if provided) */}
            {banner && <div className="w-full shrink-0 relative">{banner}</div>}

            {/* Custom Header or Standard Luxury Header */}
            {header ? (
              <div className={cn("sticky top-0 z-20 shrink-0 backdrop-blur-md", headerThemeClass)}>
                {header}
              </div>
            ) : hasHeaderContent && (
              <div
                className={cn(
                  "flex items-center justify-between px-5 sm:px-6 py-4 sticky top-0 z-20 shrink-0 backdrop-blur-md",
                  headerThemeClass,
                )}
              >
                <SectionHeaderModal
                  title={title}
                  subtitle={subtitle}
                  description={description}
                  icon={icon}
                  badge={badge}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {headerExtra}
                    {showCloseButton && (
                      <CloseButtonCustom
                        onClick={onClose}
                        variant={closeButtonVariant}
                        size="md"
                      />
                    )}
                  </div>
                </SectionHeaderModal>
              </div>
            )}

            {/* Scrollable Modal Content Body */}
            <div
              className={cn(
                "flex-1 relative min-h-0 flex flex-col overscroll-contain overflow-y-auto custom-scrollbar",
                !noPadding && "p-5 sm:p-6",
                contentClassName,
              )}
              style={{
                WebkitOverflowScrolling: "touch",
              }}
            >
              {children}
            </div>

            {/* Modal Footer (if provided) */}
            {footer && (
              <div
                className={cn(
                  "px-5 sm:px-6 py-3.5 flex items-center justify-end gap-2.5 sticky bottom-0 z-20 shrink-0 backdrop-blur-md",
                  footerThemeClass,
                )}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Re-export helpers and sub-components for direct access
export { CloseButtonCustom, CloseButton, SectionHeaderModal };
export type { CloseButtonProps, SectionHeaderModalProps };
