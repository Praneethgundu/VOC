import React from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2563EB] text-white border-transparent hover:bg-[#1D4ED8] hover:-translate-y-px shadow-sm hover:shadow-md active:scale-95",
  outline:
    "bg-white text-[#2563EB] border-[1.5px] border-[#2563EB] hover:bg-[#FFF0F2] hover:-translate-y-px active:scale-95",
  ghost:
    "bg-transparent text-[#64748B] border-transparent hover:bg-[#F8FAFC] hover:text-[#0F172A] active:scale-95",
  danger:
    "bg-[#2563EB] text-white border-transparent hover:bg-[#1D4ED8] hover:-translate-y-px active:scale-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px] gap-1.5",
  md: "px-5 py-2.5 text-[14px] gap-2",
  lg: "px-6 py-3 text-[15px] gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-semibold rounded-[10px] border transition-all duration-200 select-none cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        disabled || loading ? "opacity-60 cursor-not-allowed !transform-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

export default Button;
