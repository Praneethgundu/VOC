"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import MedicineCard from "@/components/pharmacy/MedicineCard";
import PharmacyForm from "@/components/pharmacy/PharmacyForm";
import DispenseModal from "@/components/pharmacy/DispenseModal";
import RestockModal from "@/components/pharmacy/RestockModal";
import { getMedicines, getDispenseHistory, deleteMedicine } from "@/services/pharmacyService";
import { Search, Plus, CalendarDays, Database, AlertTriangle, Pill, Clock, ClipboardList } from "lucide-react";

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [view, setView] = useState<'inventory'|'history'>('inventory');
  const [filterDate, setFilterDate] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [dispenseMed, setDispenseMed] = useState<any>(null);
  const [restockMed, setRestockMed] = useState<any>(null);

  const [kpiModal, setKpiModal] = useState<'all' | 'lowStock' | 'categories' | 'expiringSoon' | null>(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const [medsData, histData] = await Promise.all([
        getMedicines(),
        getDispenseHistory()
      ]);
      setMedicines(medsData);
      setHistory(histData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await deleteMedicine(id);
      fetchMedicines();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete medicine");
    }
  };

  const filtered = medicines.filter((m) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      m.medicineName?.toLowerCase().includes(searchLower) || 
      m.category?.toLowerCase().includes(searchLower) ||
      m.batch?.toLowerCase().includes(searchLower) ||
      m.distributor?.toLowerCase().includes(searchLower);
      
    if (!matchesSearch) return false;
    return true;
  });

  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter(m => Number(m.stock) < 50).length;
  const categoriesCount = new Set(medicines.map(m => m.category)).size;
  const expiringSoonCount = medicines.filter(m => {
    if (!m.expiryDate) return false;
    const expDate = new Date(m.expiryDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays < 90;
  }).length;

  const getKpiModalData = () => {
    let data = [...medicines];
    if (kpiModal === 'lowStock') data = data.filter(m => Number(m.stock) < 50);
    if (kpiModal === 'expiringSoon') {
      data = data.filter(m => {
        if (!m.expiryDate) return false;
        const expDate = new Date(m.expiryDate);
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays < 90;
      });
    }
    if (kpiModal === 'categories') {
      data.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }
    return data;
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <Pill className="text-[#2563EB]" />
              Pharmacy
            </h1>
            <p className="text-sm text-[#64748B]">Medicine stock and dispensing management</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2563EB] text-[#2563EB] text-xs font-bold hover:bg-[#FEE2E2] transition-colors">
              <Database size={14} /> CONNECT EXCEL DB
            </button>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-[#E2E8F0] text-xs font-semibold text-gray-700">
              <CalendarDays size={14} className="text-[#0F172A]" />
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div 
              onClick={() => setKpiModal('all')}
              className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border-[#E2E8F0] hover:border-[#2563EB]`}
            >
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Total Medicines</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{totalMedicines}</p>
            </div>
            <div 
              onClick={() => setKpiModal('lowStock')}
              className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border-[#E2E8F0] hover:border-[#2563EB]`}
            >
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Low Stock</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{lowStockCount}</p>
            </div>
            <div 
              onClick={() => setKpiModal('categories')}
              className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border-[#E2E8F0] hover:border-[#2563EB]`}
            >
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Categories</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{categoriesCount}</p>
            </div>
            <div 
              onClick={() => setKpiModal('expiringSoon')}
              className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border-[#E2E8F0] hover:border-[#2563EB]`}
            >
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Expiring Soon</p>
              <p className="text-4xl font-extrabold text-[#1E293B]">{expiringSoonCount}</p>
            </div>
          </div>

          {lowStockCount > 0 && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] px-4 py-3 rounded-xl mb-6 flex items-center gap-3 font-semibold text-sm">
              <AlertTriangle size={18} />
              {lowStockCount} medicine(s) have low stock. Please restock soon.
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-6 mb-6 border-b border-[#E2E8F0]">
            <button 
              onClick={() => setView('inventory')} 
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${view === 'inventory' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Database size={16} /> Inventory
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${view === 'history' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <ClipboardList size={16} /> Dispense History
            </button>
          </div>

          {view === 'inventory' ? (
            <>
              {/* Controls */}
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search medicines..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#2563EB] transition-colors text-sm shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => document.getElementById('dispenseTrigger')?.click()} 
                    className="bg-[#059669] hover:bg-[#047857] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
                  >
                    <Pill size={18} /> Dispense
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
                  >
                    <Plus size={18} /> Add Medicine
                  </button>
                </div>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  No medicines found matching "{search}"
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                  {filtered.map(m => (
                    <MedicineCard 
                      key={m.medicineId} 
                      medicine={m} 
                      onRestock={setRestockMed}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {/* Hidden trigger for dispense to select randomly if clicked globally */}
              <button id="dispenseTrigger" className="hidden" onClick={() => {
                const inStock = medicines.filter(m => Number(m.stock) > 0);
                if (inStock.length > 0) setDispenseMed(inStock[0]);
                else alert("No medicines in stock to dispense");
              }}></button>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                  <Clock size={18} className="text-[#2563EB]" /> Transaction Logs
                </h2>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Filter Date:</label>
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                  />
                  {filterDate && (
                    <button onClick={() => setFilterDate('')} className="text-xs text-[#2563EB] font-bold hover:underline">
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-[#E2E8F0]">
                      <th className="p-4 font-bold">Date & Time</th>
                      <th className="p-4 font-bold">Patient OP</th>
                      <th className="p-4 font-bold">Medicine</th>
                      <th className="p-4 font-bold text-center">Qty</th>
                      <th className="p-4 font-bold text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2563EB] mx-auto"></div></td></tr>
                    ) : history.filter(h => filterDate ? (h.dispensedDate || '').startsWith(filterDate) : true).length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-500">No dispense records found for the selected date.</td></tr>
                    ) : (
                      history.filter(h => filterDate ? (h.dispensedDate || '').startsWith(filterDate) : true).map((h, i) => {
                        const med = medicines.find(m => m.medicineId === h.medicineId);
                        return (
                          <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(h.dispensedDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="p-4 text-sm font-bold text-[#0F172A]">{h.opNumber}</td>
                            <td className="p-4 text-sm font-medium text-[#1E293B]">
                              {h.medicineName || h.medicineId || "Unknown"}
                            </td>
                            <td className="p-4 text-sm font-bold text-center text-gray-700 bg-gray-50 w-20">{h.quantity}</td>
                            <td className="p-4 text-sm font-bold text-[#059669] text-right">₹{h.amount}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {showAddModal && <PharmacyForm onClose={() => setShowAddModal(false)} onAdd={fetchMedicines} />}
      {dispenseMed && (
        <DispenseModal 
          initialMedicineId={dispenseMed.medicineId} 
          medicines={medicines.filter(m => Number(m.stock) > 0)}
          onClose={() => setDispenseMed(null)} 
          onSuccess={fetchMedicines} 
        />
      )}
      {restockMed && <RestockModal medicine={restockMed} onClose={() => setRestockMed(null)} onSuccess={fetchMedicines} />}

      {/* KPI Display Modal */}
      {kpiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                {kpiModal === 'all' && <><Pill size={20} className="text-[#2563EB]" /> Total Medicines</>}
                {kpiModal === 'lowStock' && <><AlertTriangle size={20} className="text-[#92400E]" /> Low Stock Medicines</>}
                {kpiModal === 'categories' && <><Database size={20} className="text-[#059669]" /> Medicines by Category</>}
                {kpiModal === 'expiringSoon' && <><Clock size={20} className="text-[#991B1B]" /> Expiring Soon</>}
              </h2>
              <button 
                onClick={() => setKpiModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-0 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-[#E2E8F0]">
                    <th className="p-4 font-bold">Medicine Name</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold text-center">Stock</th>
                    <th className="p-4 font-bold text-right">Price</th>
                    <th className="p-4 font-bold text-right">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {getKpiModalData().length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No medicines found.</td></tr>
                  ) : (
                    getKpiModalData().map((m, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-bold text-[#1E293B]">{m.medicineName}</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{m.category}</td>
                        <td className="p-4 text-sm font-bold text-center text-gray-700 bg-gray-50 w-32">
                          <span className={Number(m.stock) < 50 ? 'text-[#DC2626]' : ''}>{m.stock}</span> Units
                        </td>
                        <td className="p-4 text-sm font-bold text-[#059669] text-right">₹{m.price}</td>
                        <td className="p-4 text-sm font-bold text-gray-500 text-right">{m.expiryDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}