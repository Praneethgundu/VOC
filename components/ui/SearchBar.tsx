import React from "react";
import { Search } from "lucide-react";
import { Input } from "./Input";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = "Search...", value, onChange, className = "" }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={16} className="text-[#6B7280]" />
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 border border-[#ECECEC] rounded-lg text-[13px] focus:outline-none focus:border-[#E12D45] focus:ring-1 focus:ring-[#E12D45] transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
