"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface PatientSearchListProps {
  patients: any[];
  loading: boolean;
  selectedOpNumber: string | null;
  onSelect: (opNumber: string) => void;
}

export default function PatientSearchList({ patients, loading, selectedOpNumber, onSelect }: PatientSearchListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    const term = searchTerm.toLowerCase();
    return patients.filter(p => 
      p.fullName.toLowerCase().includes(term) || 
      p.opNumber.toLowerCase().includes(term) || 
      p.phone.includes(term)
    );
  }, [patients, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header & Search */}
      <div className="p-5">
        <h2 className="text-[15px] font-bold text-[#1A2332] mb-4">Patient Search</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search name or OP no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-gray-300 bg-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No patients found.</div>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {filteredPatients.map((p) => (
              <li 
                key={p.opNumber}
                onClick={() => onSelect(p.opNumber)}
                className={`p-5 cursor-pointer hover:bg-[#FDF8F8] transition-colors ${selectedOpNumber === p.opNumber ? 'bg-[#FDF8F8] border-l-4 border-[#800020]' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex flex-col">
                  <span className={`font-semibold text-[14px] ${selectedOpNumber === p.opNumber ? 'text-[#1A2332]' : 'text-[#1A2332]'}`}>
                    {p.fullName}
                  </span>
                  <span className="text-[13px] text-gray-400 mt-1">
                    {p.opNumber} - {p.phone}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
