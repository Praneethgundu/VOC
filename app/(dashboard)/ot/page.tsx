"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import OTForm from "@/components/ot/OTForm";
import api from "@/services/api";
import { Plus, Database, CalendarDays, CheckSquare, User, Activity, Trash2 } from "lucide-react";

export default function OTProceduresPage() {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const d = new Date();
  const initialTodayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [filterDate, setFilterDate] = useState(initialTodayStr);

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ot");
      setProcedures(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  const handleAdd = async (data: any) => {
    await api.post("/ot", data);
    setShowAddModal(false);
    fetchProcedures();
  };

  const markCompleted = async (id: string) => {
    try {
      await api.put(`/ot/${id}/status`, { status: "COMPLETED" });
      fetchProcedures();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this procedure?")) return;
    try {
      await api.delete(`/ot/${id}`);
      fetchProcedures();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete procedure");
    }
  };

  const dateFilteredProcedures = procedures.filter((proc) => {
    if (!filterDate) return true;
    if (!proc.date) return false;
    const procDateStr = proc.date.split('T')[0]; // since it's saved as YYYY-MM-DDTHH:mm:ss or YYYY-MM-DD
    return procDateStr === filterDate;
  });

  const todaysCases = dateFilteredProcedures.length;
  const inProgressCases = dateFilteredProcedures.filter(p => p.status?.toUpperCase() === "IN PROGRESS" || p.status?.toUpperCase() === "SCHEDULED").length;
  const completedCases = dateFilteredProcedures.filter(p => p.status?.toUpperCase() === "COMPLETED").length;

  const displayProcedures = dateFilteredProcedures.filter((p) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "In Progress") return p.status?.toUpperCase() === "IN PROGRESS" || p.status?.toUpperCase() === "SCHEDULED";
    if (statusFilter === "Completed") return p.status?.toUpperCase() === "COMPLETED";
    return true;
  });

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Minor OT</h1>
            <p className="text-sm text-[#64748B]">Minor surgical procedures and OT management</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2563EB] text-[#2563EB] text-xs font-bold hover:bg-[#FEE2E2] transition-colors">
              <Database size={14} /> CONNECT EXCEL DB
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-gray-700 shadow-sm relative">
              <CalendarDays size={16} className="text-[#2563EB]" />
              <input 
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="outline-none text-gray-700 bg-transparent font-semibold cursor-pointer w-[125px]"
                title="Filter by Date"
              />
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => setStatusFilter("All")}
              className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border ${statusFilter === "All" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]"}`}
            >
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Today's Cases</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{todaysCases}</p>
            </div>
            <div 
              onClick={() => setStatusFilter("In Progress")}
              className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border ${statusFilter === "In Progress" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]"}`}
            >
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">In Progress</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{inProgressCases}</p>
            </div>
            <div 
              onClick={() => setStatusFilter("Completed")}
              className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border ${statusFilter === "Completed" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]"}`}
            >
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Completed</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{completedCases}</p>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
            >
              <Plus size={16} /> Schedule Procedure
            </button>
          </div>

          {/* Procedure Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div></div>
            ) : displayProcedures.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] shadow-sm text-gray-500 font-medium">No procedures found for the selected filters.</div>
            ) : (
              displayProcedures.map((proc, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-4">
                  
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1E293B]">{proc.patientName}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">
                          {proc.opNumber} {proc.age ? `• ${proc.age} yrs` : ''} • {proc.date && proc.date.includes('T') ? new Date(proc.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {proc.status?.toUpperCase() !== 'COMPLETED' && (
                        <button 
                          onClick={() => markCompleted(proc.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#059669] text-[#059669] text-xs font-bold hover:bg-[#059669] hover:text-white transition-colors"
                        >
                          <CheckSquare size={14} /> Complete
                        </button>
                      )}
                      <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        proc.status?.toUpperCase() === 'COMPLETED' ? 'bg-[#ECFDF5] text-[#059669]' :
                        'bg-[#DBEAFE] text-[#2563EB]'
                      }`}>
                        {proc.status?.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                      <button 
                        onClick={() => handleDelete(proc.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1"
                        title="Delete Procedure"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-100 mt-2">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Procedure</p>
                      <p className="text-sm font-bold text-[#1E293B]">{proc.procedureName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Doctor</p>
                      <p className="text-sm font-bold text-[#1E293B]">{proc.doctor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fee</p>
                      <p className="text-sm font-bold text-[#0F172A]">₹{proc.cost}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm text-gray-500">{proc.notes || '-'}</p>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {showAddModal && <OTForm onClose={() => setShowAddModal(false)} onSuccess={handleAdd} />}
    </div>
  );
}
