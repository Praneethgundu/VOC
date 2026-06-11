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
    try {
      await updateInvestigation(id, { status: "COMPLETED", result: tempResult });
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

  const filtered = investigations.filter((inv) => {
    const pName = patients.find(p => p.opNumber === inv.opNumber)?.fullName || inv.patientName || "";
    const matchesSearch = pName.toLowerCase().includes(search.toLowerCase()) || 
                          inv.testName?.toLowerCase().includes(search.toLowerCase()) ||
                          inv.opNumber?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return inv.status?.toUpperCase() === "PENDING";
    if (activeTab === "In Progress") return inv.status?.toUpperCase() === "IN PROGRESS";
    if (activeTab === "Completed") return inv.status?.toUpperCase() === "COMPLETED";
    return true;
  });

  const totalOrders = investigations.length;
  const pendingOrders = investigations.filter(i => i.status?.toUpperCase() === "PENDING").length;
  const inProgressOrders = investigations.filter(i => i.status?.toUpperCase() === "IN PROGRESS").length;
  const completedOrders = investigations.filter(i => i.status?.toUpperCase() === "COMPLETED").length;

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen font-sans">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-[#ECECEC] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#800020]">Investigations</h1>
            <p className="text-sm text-[#6B7280]">Lab test orders and results management</p>
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
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Total Orders</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Pending</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{pendingOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">In Progress</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{inProgressOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Completed</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{completedOrders}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex bg-white rounded-xl border border-[#ECECEC] p-1 shadow-sm">
              {['All', 'Pending', 'In Progress', 'Completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-[#800020] text-white shadow-sm' 
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECECEC] outline-none focus:border-[#E12D45] transition-colors text-sm shadow-sm bg-white"
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#E12D45] hover:bg-[#C01D35] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
              >
                <Plus size={16} /> Order Test
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF4F4] text-[#800020] text-xs font-extrabold uppercase tracking-wider border-b border-[#ECECEC]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">OP No.</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Test Name</th>
                  <th className="p-4">Ordered By</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Result</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E12D45] mx-auto"></div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-center text-gray-500 font-medium">No tests found.</td></tr>
                ) : (
                  filtered.map((inv, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-mono text-[#800020] font-bold">{inv.id}</td>
                      <td className="p-4 text-sm font-bold text-[#E12D45]">{inv.opNumber}</td>
                      <td className="p-4 text-sm font-bold text-[#1A2332] w-40">
                        {patients.find(p => p.opNumber === inv.opNumber)?.fullName || inv.patientName || "Unknown"}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{inv.testName}</td>
                      <td className="p-4 text-sm text-gray-500">{inv.doctor}</td>
                      <td className="p-4 text-sm text-gray-500 w-24">
                        {new Date(inv.orderedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#1A2332]">₹{inv.amount}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inv.status?.toUpperCase() === 'COMPLETED' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                          inv.status?.toUpperCase() === 'IN PROGRESS' ? 'bg-[#DBEAFE] text-[#2563EB]' :
                          'bg-[#FEF9C3] text-[#CA8A04]'
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
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#16A34A]"
                          />
                        ) : (
                          <span className={`text-sm font-medium ${
                            inv.result === 'Normal' ? 'text-[#16A34A]' : 'text-[#1A2332]'
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
                              disabled={editingResultId !== inv.id || !tempResult}
                              className="flex items-center justify-center gap-1 w-16 border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#16A34A] transition-colors rounded-lg py-1 px-2"
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