import React from "react";
import { Filter } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function FilterDropdown({ options, value, onChange, className = "" }: FilterDropdownProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Filter size={14} className="text-[#6B7280]" />
      </div>
      <select
        className="w-full pl-9 pr-8 py-2 border border-[#ECECEC] rounded-lg text-[13px] text-[#1A2332] focus:outline-none focus:border-[#E12D45] focus:ring-1 focus:ring-[#E12D45] transition-colors appearance-none bg-white cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
