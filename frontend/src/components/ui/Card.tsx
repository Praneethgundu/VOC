import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-xl border border-[#ECECEC] transition-all duration-200",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(128,0,32,0.04)]",
        hover
          ? "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(128,0,32,0.08)] cursor-pointer"
          : "",
        paddingStyles[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
}

export function CardHeader({ title, subtitle, action, icon, iconBg }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              iconBg || "bg-[#FFF0F2]"
            }`}
          >
            {icon}
          </div>
        )}
        <div>
          <h2 className="section-heading">{title}</h2>
          {subtitle && (
            <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default Card;
