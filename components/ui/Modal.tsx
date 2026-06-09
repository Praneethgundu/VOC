"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(92,0,24,0.18)", backdropFilter: "blur(4px)" }}
    >
      <div
        className={[
          "relative w-full rounded-[20px] overflow-hidden animate-fade-in",
          "border border-[rgba(128,0,32,0.12)]",
          sizeStyles[size],
        ].join(" ")}
        style={{
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 32px 80px rgba(92,0,24,0.2)",
        }}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#ECECEC]">
            <div>
              {title && (
                <h2 className="text-[18px] font-800 text-[#800020] font-extrabold leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[13px] text-[#6B7280] mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FDF8F8] hover:text-[#800020] transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#ECECEC] bg-[#FDF8F8]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
