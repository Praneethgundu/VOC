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

  const todaysCases = procedures.length;
  const inProgressCases = procedures.filter(p => p.status?.toUpperCase() === "IN PROGRESS" || p.status?.toUpperCase() === "SCHEDULED").length;
  const completedCases = procedures.filter(p => p.status?.toUpperCase() === "COMPLETED").length;

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen font-sans">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-[#ECECEC] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#800020]">Minor OT</h1>
            <p className="text-sm text-[#6B7280]">Minor surgical procedures and OT management</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E12D45] text-[#E12D45] text-xs font-bold hover:bg-[#FFF4F4] transition-colors">
              <Database size={14} /> CONNECT EXCEL DB
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-[#ECECEC] text-sm font-semibold text-gray-700 shadow-sm">
              <CalendarDays size={16} className="text-[#E12D45]" />
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Today's Cases</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{todaysCases}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">In Progress</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{inProgressCases}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Completed</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{completedCases}</p>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#E12D45] hover:bg-[#C01D35] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
            >
              <Plus size={16} /> Schedule Procedure
            </button>
          </div>

          {/* Procedure Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E12D45] mx-auto"></div></div>
            ) : procedures.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#ECECEC] shadow-sm text-gray-500 font-medium">No procedures scheduled today.</div>
            ) : (
              procedures.map((proc, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm p-6 flex flex-col gap-4">
                  
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1A2332]">{proc.patientName}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">
                          {proc.opNumber} {proc.age ? `• ${proc.age} yrs` : ''} • {proc.date ? new Date(proc.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {proc.status?.toUpperCase() !== 'COMPLETED' && (
                        <button 
                          onClick={() => markCompleted(proc.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#16A34A] text-[#16A34A] text-xs font-bold hover:bg-[#16A34A] hover:text-white transition-colors"
                        >
                          <CheckSquare size={14} /> Complete
                        </button>
                      )}
                      <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        proc.status?.toUpperCase() === 'COMPLETED' ? 'bg-[#DCFCE7] text-[#16A34A]' :
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
                      <p className="text-sm font-bold text-[#1A2332]">{proc.procedure}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Doctor</p>
                      <p className="text-sm font-bold text-[#1A2332]">{proc.doctor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fee</p>
                      <p className="text-sm font-bold text-[#800020]">₹{proc.fee}</p>
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
