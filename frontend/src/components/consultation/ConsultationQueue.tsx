"use client";

import { useEffect, useState } from "react";
import { getConsultations } from "@/services/consultationService";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/ui/Table";
import { RefreshCw } from "lucide-react";

export default function ConsultationQueue({ onSelect, selectedId }: { onSelect: (patient: any) => void, selectedId?: string }) {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getConsultations();
      setConsultations(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "DONE" || status === "Completed") return "text-[#16A34A]";
    if (status === "IN CONSULTATION" || status === "In Consultation") return "text-[#2563EB]";
    return "text-[#D97706]"; // WAITING
  };

  return (
    <div className="bg-white rounded-xl border border-[#ECECEC] p-4 flex flex-col h-full" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-[14px] font-bold text-[#1A2332]">Today's Queue ({consultations.length})</h2>
        </div>
        <button onClick={fetchQueue} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-gray-100 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-[#6B7280] text-[13px]">Loading...</div>
        ) : consultations.length === 0 ? (
          <div className="py-8 text-center text-[#6B7280] text-[13px]">No consultations found.</div>
        ) : (
          consultations.map((c, i) => {
            const isSelected = selectedId === c.id;
            return (
              <div 
                key={c.id || i} 
                onClick={() => onSelect(c)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? "border-[#E12D45] bg-[#FFF0F2] shadow-sm" 
                    : "border-[#ECECEC] bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <h3 className="font-bold text-[#1A2332] text-[14px] mb-1">{c.patientName}</h3>
                <p className="text-[12px] text-[#6B7280] mb-2">{c.opNumber} • {c.department || "Orthopaedics"}</p>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${getStatusColor(c.status)}`}>
                  {c.status || "WAITING"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
