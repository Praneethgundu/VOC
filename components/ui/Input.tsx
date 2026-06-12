import React from "react";

/* ─── Input ─────────────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, hint, icon, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold text-[#1E293B]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={[
            "w-full h-12 rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-3 py-0",
            "text-[14px] text-[#1E293B] placeholder:text-[#64748B]",
            "outline-none transition-all duration-200",
            "focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#F9F9F9]",
            "read-only:bg-[#F8FAFC] read-only:cursor-default",
            error ? "border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.18)]" : "",
            icon ? "pl-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
      {error && <p className="text-[12px] text-[#2563EB] font-medium">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#64748B]">{hint}</p>}
    </div>
  );
}

/* ─── Select ─────────────────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({ label, error, hint, className = "", id, children, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-[13px] font-semibold text-[#1E293B]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={[
          "w-full h-12 rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-3",
          "text-[14px] text-[#1E293B]",
          "outline-none transition-all duration-200 cursor-pointer",
          "focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          error ? "border-[#2563EB]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </select>
      {error && <p className="text-[12px] text-[#2563EB] font-medium">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#64748B]">{hint}</p>}
    </div>
  );
}

/* ─── Textarea ───────────────────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = "", id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-[13px] font-semibold text-[#1E293B]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        {...props}
        className={[
          "w-full rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-3 py-3",
          "text-[14px] text-[#1E293B] placeholder:text-[#64748B]",
          "outline-none transition-all duration-200 resize-y min-h-[96px]",
          "focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          error ? "border-[#2563EB]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && <p className="text-[12px] text-[#2563EB] font-medium">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#64748B]">{hint}</p>}
    </div>
  );
}

export default Input;
