import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden pointer-events-auto",
  closeOnBackdropClick = true,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={className}
          onClick={closeOnBackdropClick ? onClose : undefined}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
