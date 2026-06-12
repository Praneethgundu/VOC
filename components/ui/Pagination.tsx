import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] ${className}`}>
      <div className="flex items-center text-[13px] text-[#64748B]">
        Showing page <span className="font-semibold text-[#1E293B] mx-1">{currentPage}</span> of <span className="font-semibold text-[#1E293B] mx-1">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={<ChevronLeft size={14} />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={<ChevronRight size={14} />}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
