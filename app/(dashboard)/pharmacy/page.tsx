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

  const filtered = medicines.filter((m) =>
    m.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter(m => Number(m.stock) < 50).length;
  const categoriesCount = new Set(medicines.map(m => m.category)).size;
  // Let's just mock expiring soon for UI purpose
  const expiringSoonCount = medicines.filter(m => {
    if (!m.expiryDate) return false;
    const expDate = new Date(m.expiryDate);
    const today = new Date();
    const diffTime = Math.abs(expDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays < 90;
  }).length;

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <div className="bg-white border-b border-[#ECECEC] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#800020] flex items-center gap-2">
              <Pill className="text-[#E12D45]" />
              Pharmacy
            </h1>
            <p className="text-sm text-[#6B7280]">Medicine stock and dispensing management</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E12D45] text-[#E12D45] text-xs font-bold hover:bg-[#FFF4F4] transition-colors">
              <Database size={14} /> CONNECT EXCEL DB
            </button>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-[#ECECEC] text-xs font-semibold text-gray-700">
              <CalendarDays size={14} className="text-[#800020]" />
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Total Medicines</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{totalMedicines}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Low Stock</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{lowStockCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Categories</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{categoriesCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#ECECEC] shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Expiring Soon</p>
              <p className="text-4xl font-extrabold text-[#1A2332]">{expiringSoonCount}</p>
            </div>
          </div>

          {lowStockCount > 0 && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] px-4 py-3 rounded-xl mb-6 flex items-center gap-3 font-semibold text-sm">
              <AlertTriangle size={18} />
              {lowStockCount} medicine(s) have low stock. Please restock soon.
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-6 mb-6 border-b border-[#ECECEC]">
            <button 
              onClick={() => setView('inventory')} 
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${view === 'inventory' ? 'border-[#E12D45] text-[#E12D45]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Database size={16} /> Inventory
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${view === 'history' ? 'border-[#E12D45] text-[#E12D45]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#ECECEC] outline-none focus:border-[#E12D45] transition-colors text-sm shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => document.getElementById('dispenseTrigger')?.click()} 
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
                  >
                    <Pill size={18} /> Dispense
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#E12D45] hover:bg-[#C01D35] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
                  >
                    <Plus size={18} /> Add Medicine
                  </button>
                </div>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E12D45]"></div>
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
            <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#ECECEC] flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#1A2332] flex items-center gap-2">
                  <Clock size={18} className="text-[#E12D45]" /> Transaction Logs
                </h2>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Filter Date:</label>
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border border-[#ECECEC] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E12D45]"
                  />
                  {filterDate && (
                    <button onClick={() => setFilterDate('')} className="text-xs text-[#E12D45] font-bold hover:underline">
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-[#ECECEC]">
                      <th className="p-4 font-bold">Date & Time</th>
                      <th className="p-4 font-bold">Patient OP</th>
                      <th className="p-4 font-bold">Medicine</th>
                      <th className="p-4 font-bold text-center">Qty</th>
                      <th className="p-4 font-bold text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E12D45] mx-auto"></div></td></tr>
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
                            <td className="p-4 text-sm font-bold text-[#800020]">{h.opNumber}</td>
                            <td className="p-4 text-sm font-medium text-[#1A2332]">
                              {h.medicineName || h.medicineId || "Unknown"}
                            </td>
                            <td className="p-4 text-sm font-bold text-center text-gray-700 bg-gray-50 w-20">{h.quantity}</td>
                            <td className="p-4 text-sm font-bold text-[#16A34A] text-right">₹{h.amount}</td>
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
    </div>
  );
}