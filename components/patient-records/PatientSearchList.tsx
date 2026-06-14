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
  const [selectedDate, setSelectedDate] = useState("");

  const filteredPatients = useMemo(() => {
    let result = patients;
    
    if (selectedDate) {
      result = result.filter(p => {
        const pDate = p.appointmentDate || (p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : "");
        return pDate === selectedDate;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.fullName.toLowerCase().includes(term) || 
        p.opNumber.toLowerCase().includes(term) || 
        p.phone.includes(term)
      );
    }
    
    return result;
  }, [patients, searchTerm, selectedDate]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header & Search */}
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-[15px] font-bold text-[#1E293B] mb-4">Patient Search</h2>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search name or OP no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-gray-300 bg-white placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-gray-300 bg-white text-gray-700"
            />
          </div>
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
                className={`p-5 cursor-pointer hover:bg-[#F8FAFC] transition-colors ${selectedOpNumber === p.opNumber ? 'bg-[#F8FAFC] border-l-4 border-[#0F172A]' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className={`font-semibold text-[14px] ${selectedOpNumber === p.opNumber ? 'text-[#1E293B]' : 'text-[#1E293B]'}`}>
                      {p.fullName}
                    </span>
                    <span className="text-[13px] text-gray-400 mt-1">
                      {p.opNumber} - {p.phone}
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {p.appointmentTime || (p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '')}
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
