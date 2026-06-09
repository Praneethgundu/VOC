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
          className="text-[13px] font-semibold text-[#1A2332]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={[
            "w-full h-12 rounded-lg border border-[rgba(128,0,32,0.12)] bg-white px-3 py-0",
            "text-[14px] text-[#1A2332] placeholder:text-[#9CA3AF]",
            "outline-none transition-all duration-200",
            "focus:border-[#E12D45] focus:shadow-[0_0_0_3px_rgba(225,45,69,0.12)]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#F9F9F9]",
            "read-only:bg-[#FDF8F8] read-only:cursor-default",
            error ? "border-[#E12D45] focus:shadow-[0_0_0_3px_rgba(225,45,69,0.18)]" : "",
            icon ? "pl-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
      {error && <p className="text-[12px] text-[#E12D45] font-medium">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#6B7280]">{hint}</p>}
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
        <label htmlFor={selectId} className="text-[13px] font-semibold text-[#1A2332]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={[
          "w-full h-12 rounded-lg border border-[rgba(128,0,32,0.12)] bg-white px-3",
          "text-[14px] text-[#1A2332]",
          "outline-none transition-all duration-200 cursor-pointer",
          "focus:border-[#E12D45] focus:shadow-[0_0_0_3px_rgba(225,45,69,0.12)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          error ? "border-[#E12D45]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </select>
      {error && <p className="text-[12px] text-[#E12D45] font-medium">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#6B7280]">{hint}</p>}
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
        <label htmlFor={textareaId} className="text-[13px] font-semibold text-[#1A2332]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        {...props}
        className={[
          "w-full rounded-lg border border-[rgba(128,0,32,0.12)] bg-white px-3 py-3",
          "text-[14px] text-[#1A2332] placeholder:text-[#9CA3AF]",
          "outline-none transition-all duration-200 resize-y min-h-[96px]",
          "focus:border-[#E12D45] focus:shadow-[0_0_0_3px_rgba(225,45,69,0.12)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          error ? "border-[#E12D45]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && <p className="text-[12px] text-[#E12D45] font-medium">{error}</p>}
      {hint && !error && <p className="text-[12px] text-[#6B7280]">{hint}</p>}
    </div>
  );
}

export default Input;
