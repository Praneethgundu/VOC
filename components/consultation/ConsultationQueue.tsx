"use client";

import { useEffect, useState } from "react";
import { getConsultations, deleteConsultation } from "@/services/consultationService";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/ui/Table";
import { Search, RefreshCw, Trash2 } from "lucide-react";

export default function ConsultationQueue({ onSelect, selectedId }: { onSelect: (patient: any) => void, selectedId?: string }) {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getConsultations();
      
      // Calculate visit numbers
      const sortedAll = [...data].sort((a, b) => new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime());
      const patientVisitCounts: Record<string, number> = {};
      const visitNumberMap = new Map<string, number>();
      
      sortedAll.forEach(c => {
        const count = (patientVisitCounts[c.patientId] || 0) + 1;
        patientVisitCounts[c.patientId] = count;
        visitNumberMap.set(c.id, count);
      });

      const enrichedData = data.map((c: any) => ({
        ...c,
        visitNumber: visitNumberMap.get(c.id) || 1
      }));
      setConsultations(enrichedData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this consultation?")) return;
    try {
      await deleteConsultation(id);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "DONE" || status === "Completed") return "text-[#059669]";
    if (status === "IN CONSULTATION" || status === "In Consultation") return "text-[#2563EB]";
    return "text-[#92400E]"; // WAITING
  };

  const getOrdinal = (n: number) => {
    const num = n || 1;
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const filteredConsultations = consultations.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.patientName?.toLowerCase().includes(q) ||
        c.opNumber?.toLowerCase().includes(q)
      );
    }
    return c.consultationDate?.startsWith(selectedDate);
  });

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col h-full" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)" }}>
      <div className="flex flex-col gap-3 mb-4 px-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[#1E293B]">
            {isToday && !searchQuery.trim() ? "Today's Queue" : "Search Results"} ({filteredConsultations.length})
          </h2>
          <button onClick={fetchQueue} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-gray-100 transition-colors shrink-0">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Search OP or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-[#E2E8F0] rounded-lg text-[#334155] outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSearchQuery(""); // clear search when date changes
            }}
            className="w-[110px] text-[12px] border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-[#64748B] outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-[#64748B] text-[13px]">Loading...</div>
        ) : filteredConsultations.length === 0 ? (
          <div className="py-8 text-center text-[#64748B] text-[13px]">
            {searchQuery.trim() ? "No results found for your search." : "No consultations found for this date."}
          </div>
        ) : (
          filteredConsultations.map((c, i) => {
            const isSelected = selectedId === c.id;
            return (
              <div 
                key={c.id || i} 
                onClick={() => onSelect(c)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? "border-[#2563EB] bg-[#FFF0F2] shadow-sm" 
                    : "border-[#E2E8F0] bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-[#1E293B] text-[14px]">{c.patientName}</h3>
                  <button 
                    onClick={(e) => handleDelete(e, c.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                    title="Delete Consultation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-[12px] text-[#64748B] mb-2">
                  {c.opNumber} • {new Date(c.consultationDate || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • {c.department || "Orthopaedics"}
                </p>
                <div className="flex justify-between items-center">
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${getStatusColor(c.status)}`}>
                    {c.status || "WAITING"}
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                      {getOrdinal(c.visitNumber || 1)} Consultation
                    </div>
                    {c.complaint && c.complaint !== "N/A" && (
                      <div className="text-[11px] font-bold text-[#0F172A] bg-[#FFF0F2] px-2 py-0.5 rounded">
                        {c.complaint}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
