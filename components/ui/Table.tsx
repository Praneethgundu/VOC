import React from "react";

/* ─── Table ──────────────────────────────────────────────────────────────── */
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className={`w-full border-collapse text-[14px] ${className}`}>
        {children}
      </table>
    </div>
  );
}

/* ─── THead ──────────────────────────────────────────────────────────────── */
export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-[#FEE2E2]">{children}</thead>;
}

/* ─── TH ─────────────────────────────────────────────────────────────────── */
interface ThProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function Th({ children, className = "", align = "left" }: ThProps) {
  return (
    <th
      className={[
        "table-header px-4 py-3 border-b border-[#FEE2E2]",
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left",
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

/* ─── TBody ──────────────────────────────────────────────────────────────── */
export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

/* ─── TR ─────────────────────────────────────────────────────────────────── */
interface TrProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
  onClick?: () => void;
}

export function Tr({ children, index = 0, className = "", onClick }: TrProps) {
  const isOdd = index % 2 !== 0;
  return (
    <tr
      onClick={onClick}
      className={[
        "border-b border-[#FEE2E2] transition-colors duration-100",
        "hover:bg-[#FAFAFA]",
        isOdd ? "bg-[#FEE2E2]" : "bg-white",
        onClick ? "cursor-pointer" : "",
        className,
      ].join(" ")}
    >
      {children}
    </tr>
  );
}

/* ─── TD ─────────────────────────────────────────────────────────────────── */
interface TdProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  colSpan?: number;
}

export function Td({ children, className = "", align = "left", colSpan }: TdProps) {
  return (
    <td
      colSpan={colSpan}
      className={[
        "px-4 py-3 text-[#1E293B]",
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left",
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
type StatusType = "success" | "warning" | "error" | "info" | "default";

interface BadgeProps {
  status: StatusType;
  children: React.ReactNode;
}

const badgeStyles: Record<StatusType, string> = {
  success: "bg-[#ECFDF5] text-[#059669] border border-[#ECFDF5]",
  warning: "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]",
  error: "bg-[#FEE2E2] text-[#2563EB] border border-[#FEE2E2]",
  info: "bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE]",
  default: "bg-[#F3F4F6] text-[#64748B] border border-[#E2E8F0]",
};

export function Badge({ status, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-700 font-bold whitespace-nowrap",
        badgeStyles[status],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Table;
