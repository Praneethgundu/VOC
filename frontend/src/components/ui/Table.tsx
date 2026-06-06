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
  return <thead className="bg-[#FBEAEA]">{children}</thead>;
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
        "table-header px-4 py-3 border-b border-[#F0D0D0]",
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
        "border-b border-[#F5E8E8] transition-colors duration-100",
        "hover:bg-[#FAFAFA]",
        isOdd ? "bg-[#FDF6F6]" : "bg-white",
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
        "px-4 py-3 text-[#1A2332]",
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
  success: "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]",
  warning: "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
  error: "bg-[#FEE2E2] text-[#E12D45] border border-[#FCA5A5]",
  info: "bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]",
  default: "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]",
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
