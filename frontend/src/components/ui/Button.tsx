import React from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#E12D45] text-white border-transparent hover:bg-[#C9263D] hover:-translate-y-px shadow-sm hover:shadow-md active:scale-95",
  outline:
    "bg-white text-[#E12D45] border-[1.5px] border-[#E12D45] hover:bg-[#FFF0F2] hover:-translate-y-px active:scale-95",
  ghost:
    "bg-transparent text-[#6B7280] border-transparent hover:bg-[#FDF8F8] hover:text-[#800020] active:scale-95",
  danger:
    "bg-[#E12D45] text-white border-transparent hover:bg-[#C9263D] hover:-translate-y-px active:scale-95",
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
