"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import InvestigationForm from "@/components/investigations/InvestigationForm";
import { getInvestigations, updateInvestigation, deleteInvestigation } from "@/services/investigationService";
import { getPatients } from "@/services/patientService";
import { Search, Plus, CalendarDays, Database, Check, Trash2 } from "lucide-react";

export default function InvestigationPage() {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [tempResult, setTempResult] = useState("");

  const d = new Date();
  const initialTodayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [filterDate, setFilterDate] = useState(initialTodayStr);

  const fetchInvestigations = async () => {
    setLoading(true);
    try {
      const [data, patientsData] = await Promise.all([
        getInvestigations(),
        getPatients()
      ]);
      setInvestigations(data);
      setPatients(patientsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleUpdateResult = async (id: string) => {
    if (!tempResult.trim()) {
      alert("Result is required to complete the test.");
      return;
    }
    try {
      await updateInvestigation(id, { status: "COMPLETED", result: tempResult.trim() });
      setEditingResultId(null);
      setTempResult("");
      fetchInvestigations();
    } catch (e) {
      alert("Failed to update result");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await deleteInvestigation(id);
      fetchInvestigations();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete test");
    }
  };

  const baseFiltered = investigations.filter((inv) => {
    const pName = patients.find(p => p.opNumber === inv.opNumber)?.fullName || inv.patientName || "";
    const matchesSearch = pName.toLowerCase().includes(search.toLowerCase()) || 
                          inv.testName?.toLowerCase().includes(search.toLowerCase()) ||
                          inv.opNumber?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterDate) {
      const d = new Date(inv.orderedDate);
      const invDateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (invDateStr !== filterDate) return false;
    }
    return true;
  });

  const filtered = baseFiltered.filter((inv) => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return inv.status?.toUpperCase() === "PENDING";
    if (activeTab === "In Progress") return inv.status?.toUpperCase() === "IN PROGRESS";
    if (activeTab === "Completed") return inv.status?.toUpperCase() === "COMPLETED";
    return true;
  });

  const totalOrders = baseFiltered.length;
  const pendingOrders = baseFiltered.filter(i => i.status?.toUpperCase() === "PENDING").length;
  const inProgressOrders = baseFiltered.filter(i => i.status?.toUpperCase() === "IN PROGRESS").length;
  const completedOrders = baseFiltered.filter(i => i.status?.toUpperCase() === "COMPLETED").length;

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Investigations</h1>
            <p className="text-sm text-[#64748B]">Lab test orders and results management</p>
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
                max={initialTodayStr}
                onChange={(e) => setFilterDate(e.target.value)}
                className="outline-none text-gray-700 bg-transparent font-semibold cursor-pointer w-[125px]"
                title="Filter by Date"
              />
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Total Orders</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Pending</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{pendingOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">In Progress</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{inProgressOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Completed</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{completedOrders}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex bg-white rounded-xl border border-[#E2E8F0] p-1 shadow-sm">
              {['All', 'Pending', 'In Progress', 'Completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-[#0F172A] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab} ({
                    tab === 'All' ? totalOrders :
                    tab === 'Pending' ? pendingOrders :
                    tab === 'In Progress' ? inProgressOrders : completedOrders
                  })
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#2563EB] transition-colors text-sm shadow-sm bg-white"
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
              >
                <Plus size={16} /> Order Test
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FEE2E2] text-[#0F172A] text-xs font-extrabold uppercase tracking-wider border-b border-[#E2E8F0]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">OP No.</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Test Name</th>
                  <th className="p-4">Ordered By</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Result</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2563EB] mx-auto"></div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-center text-gray-500 font-medium">No tests found.</td></tr>
                ) : (
                  filtered.map((inv, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-mono text-[#0F172A] font-bold">{inv.id}</td>
                      <td className="p-4 text-sm font-bold text-[#2563EB]">{inv.opNumber}</td>
                      <td className="p-4 text-sm font-bold text-[#1E293B] w-40">
                        {patients.find(p => p.opNumber === inv.opNumber)?.fullName || inv.patientName || "Unknown"}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{inv.testName}</td>
                      <td className="p-4 text-sm text-gray-500">{inv.doctor}</td>
                      <td className="p-4 text-sm text-gray-500 w-28">
                        {new Date(inv.orderedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-sm text-gray-500 w-24">
                        {new Date(inv.orderedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#1E293B]">₹{inv.amount}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inv.status?.toUpperCase() === 'COMPLETED' ? 'bg-[#ECFDF5] text-[#059669]' :
                          inv.status?.toUpperCase() === 'IN PROGRESS' ? 'bg-[#DBEAFE] text-[#2563EB]' :
                          'bg-[#FFFBEB] text-[#92400E]'
                        }`}>
                          {inv.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 w-48">
                        {inv.status?.toUpperCase() === 'IN PROGRESS' ? (
                          <input 
                            type="text"
                            placeholder="Enter result..."
                            value={editingResultId === inv.id ? tempResult : ''}
                            onChange={(e) => {
                              setEditingResultId(inv.id);
                              setTempResult(e.target.value);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#059669]"
                          />
                        ) : (
                          <span className={`text-sm font-medium ${
                            inv.result === 'Normal' ? 'text-[#059669]' : 'text-[#1E293B]'
                          }`}>
                            {inv.result || '-'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {inv.status?.toUpperCase() === 'IN PROGRESS' ? (
                            <button 
                              onClick={() => handleUpdateResult(inv.id)}
                              disabled={editingResultId !== inv.id || !tempResult.trim()}
                              className="flex items-center justify-center gap-1 w-16 border border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#059669] transition-colors rounded-lg py-1 px-2"
                            >
                              <Check size={14} />
                              <span className="text-[10px] font-bold">Done</span>
                            </button>
                          ) : inv.status?.toUpperCase() === 'PENDING' ? (
                            <button 
                              onClick={() => updateInvestigation(inv.id, { status: "IN PROGRESS" }).then(fetchInvestigations)}
                              className="text-xs font-bold text-[#2563EB] hover:underline"
                            >
                              Start Test
                            </button>
                          ) : null}
                          
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Test"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {showAddModal && <InvestigationForm onClose={() => setShowAddModal(false)} onSuccess={fetchInvestigations} />}
    </div>
  );
}