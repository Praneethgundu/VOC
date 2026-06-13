"use client";

import { useEffect, useState } from "react";
import { getConsultations, deleteConsultation } from "@/services/consultationService";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/ui/Table";
import { RefreshCw, Trash2 } from "lucide-react";

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
      const todayStr = new Date().toISOString().split("T")[0];
      // Fallback: If no date is saved, we might miss them, but let's assume they have consultationDate
      const todaysData = data.filter((c: any) => {
        if (!c.consultationDate) return false;
        return c.consultationDate.startsWith(todayStr);
      });
      setConsultations(todaysData);
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

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col h-full" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)" }}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-[14px] font-bold text-[#1E293B]">Today's Queue ({consultations.length})</h2>
        </div>
        <button onClick={fetchQueue} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-gray-100 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-[#64748B] text-[13px]">Loading...</div>
        ) : consultations.length === 0 ? (
          <div className="py-8 text-center text-[#64748B] text-[13px]">No consultations found.</div>
        ) : (
          consultations.map((c, i) => {
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
                  {c.complaint && c.complaint !== "N/A" && (
                    <div className="text-[11px] font-bold text-[#0F172A] bg-[#FFF0F2] px-2 py-0.5 rounded">
                      {c.complaint}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
