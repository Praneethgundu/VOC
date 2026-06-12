import React, { useState, useEffect, useRef } from 'react';
import { getInvestigationMaster } from '@/services/investigationService';
import { Search, ChevronDown } from 'lucide-react';

export interface InvestigationMasterData {
  code: string;
  name: string;
  description: string;
  category: string;
  type: string;
  price: number;
}

interface InvestigationSelectProps {
  value: InvestigationMasterData | null;
  onChange: (investigation: InvestigationMasterData) => void;
  className?: string;
}

export default function InvestigationSelect({ value, onChange, className = '' }: InvestigationSelectProps) {
  const [data, setData] = useState<InvestigationMasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getInvestigationMaster()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load investigation master data", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredData = data.filter(item => {
    const s = search.toLowerCase();
    return (
      item.code.toLowerCase().includes(s) ||
      item.name.toLowerCase().includes(s) ||
      item.category.toLowerCase().includes(s) ||
      item.price.toString().includes(s)
    );
  }).slice(0, 50); // Limit visible results to 50 for performance

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div 
        className="h-10 px-3 rounded-lg border border-gray-200 bg-white flex items-center justify-between cursor-pointer focus-within:border-[#2563EB]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm truncate pr-2">
          {value ? `${value.name} — ₹${value.price}` : "Select Investigation..."}
        </span>
        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Search by code, name, category, or price..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading master data...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No investigations found</div>
            ) : (
              filteredData.map((item, index) => (
                <div 
                  key={index}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 flex flex-col"
                  onClick={() => {
                    onChange(item);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-900 truncate pr-4">{item.name}</span>
                    <span className="text-sm font-bold text-[#2563EB] flex-shrink-0">₹{item.price}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.code}</span>
                    <span className="truncate">{item.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
