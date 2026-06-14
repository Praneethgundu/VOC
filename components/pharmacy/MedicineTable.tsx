"use client";

import { useEffect, useState } from "react";
import { getMedicines } from "@/services/pharmacyService";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Search, RefreshCw, AlertTriangle } from "lucide-react";

function stockStatus(qty: number): { label: string; status: "success" | "warning" | "error" } {
  if (qty <= 0) return { label: "Out of Stock", status: "error" };
  if (qty < 50) return { label: "Low Stock", status: "error" };
  return { label: "In Stock", status: "success" };
}

export default function MedicineTable() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [dispenseMedicineData, setDispenseMedicineData] = useState<any>(null);
  const [dispenseForm, setDispenseForm] = useState({ opNumber: "", quantity: 1, amount: 0 });
  const [detailModal, setDetailModal] = useState<any>(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch { /* silence */ }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchMedicines(); 
    import("@/services/patientService").then(m => m.getPatients().then(setPatients).catch(() => {}));
  }, []);

  const searchOp = dispenseForm.opNumber ? dispenseForm.opNumber.trim().toLowerCase() : "";
  const foundPatient = searchOp ? patients.find(p => p.opNumber && p.opNumber.trim().toLowerCase() === searchOp) : null;
  const patientName = searchOp 
    ? (foundPatient ? (foundPatient.fullName || foundPatient.patientName || "Unknown Name") : "Patient not found")
    : "";

  const handleDispense = async () => {
    if (!dispenseMedicineData) return;
    try {
      const { dispenseMedicine } = await import("@/services/pharmacyService");
      await dispenseMedicine({
        medicineId: dispenseMedicineData.medicineId,
        opNumber: dispenseForm.opNumber,
        quantity: dispenseForm.quantity,
        amount: dispenseForm.amount,
      });
      alert("Medicine Dispensed Successfully!");
      setDispenseMedicineData(null);
      setDispenseForm({ opNumber: "", quantity: 1, amount: 0 });
      fetchMedicines();
    } catch (e) {
      console.error(e);
      alert("Failed to dispense");
    }
  };

  const filtered = medicines.filter((m) =>
    m.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase()) ||
    m.medicineId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="bg-white rounded-xl border border-[#E2E8F0] p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-heading">Medicine Inventory</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">{medicines.length} medicines on record</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 h-9">
            <Search size={13} className="text-[#64748B] shrink-0" />
            <input
              type="text"
              placeholder="Search medicine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-[13px] text-[#1E293B] placeholder:text-[#64748B] w-40"
            />
          </div>
          <button
            onClick={fetchMedicines}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-[#64748B]">
          <RefreshCw size={24} className="animate-spin text-[#2563EB]" />
          <p className="text-[13px]">Loading inventory…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] text-[13px]">No medicines found.</div>
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Medicine ID</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Batch</Th>
              <Th>Distributor</Th>
              <Th align="center">Qty</Th>
              <Th align="right">Price</Th>
              <Th>Expiry Date</Th>
              <Th align="center">Stock Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {filtered.map((m, i) => {
              const qty = Number(m.stock ?? m.quantity ?? 0);
              const stock = stockStatus(qty);
              return (
                <Tr key={m.medicineId ?? i} index={i} onClick={() => setDetailModal(m)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <Td>
                    <span className="font-mono text-[13px] font-semibold text-[#0F172A]">{m.medicineId}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {qty < 20 && <AlertTriangle size={13} className="text-[#92400E] shrink-0" />}
                      <span className="font-medium text-[#1E293B]">{m.medicineName}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[rgba(15,23,42,0.1)] text-[#0F172A] text-[11px] font-semibold rounded-md">
                      {m.category}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-[13px] text-[#64748B]">{m.batch || '-'}</span>
                  </Td>
                  <Td>
                    <span className="text-[13px] text-[#64748B]">{m.distributor || '-'}</span>
                  </Td>
                  <Td align="center">
                    <span className="font-mono font-bold text-[14px]">{qty}</span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono text-[14px] font-semibold text-[#059669]">₹{Number(m.price).toFixed(2)}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[13px] text-[#64748B]">{m.expiryDate}</span>
                  </Td>
                  <Td align="center">
                    <Badge status={stock.status}>{stock.label}</Badge>
                  </Td>
                  <Td align="right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDispenseMedicineData(m);
                        setDispenseForm({ opNumber: "", quantity: 1, amount: Number(m.price) });
                      }}
                      disabled={qty <= 0}
                      className="px-3 py-1 bg-[#059669] text-white text-[11px] font-bold rounded hover:bg-[#047857] disabled:opacity-50"
                    >
                      Dispense
                    </button>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      )}

      {dispenseMedicineData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h3 className="text-lg font-bold mb-4 text-[#1E293B]">Dispense Medicine</h3>
            <div className="mb-4 text-[13px] text-[#64748B]">
              <p>Medicine: <strong className="text-[#1E293B]">{dispenseMedicineData.medicineName}</strong></p>
              <p>Available: <strong className="text-[#1E293B]">{dispenseMedicineData.stock ?? dispenseMedicineData.quantity}</strong></p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold mb-1">Patient OP Number</label>
                <input
                  type="text"
                  value={dispenseForm.opNumber}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, opNumber: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-sm"
                  placeholder="e.g. OP1234"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Patient Name</label>
                <input
                  type="text"
                  readOnly
                  value={patientName}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-sm bg-gray-50 text-gray-700"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={dispenseMedicineData.stock ?? dispenseMedicineData.quantity}
                  value={dispenseForm.quantity}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: Number(e.target.value), amount: Number(e.target.value) * Number(dispenseMedicineData.price) })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  readOnly
                  value={dispenseForm.amount}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-sm bg-gray-50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setDispenseMedicineData(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDispense}
                className="px-4 py-2 bg-[#2563EB] text-white text-sm font-bold rounded"
              >
                Confirm Dispense
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0F172A] p-5 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold">{detailModal.medicineName}</h2>
              <button onClick={() => setDetailModal(null)} className="text-gray-300 hover:text-white">x</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Medicine ID</p>
                  <p className="font-semibold">{detailModal.medicineId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Category</p>
                  <p className="font-semibold">{detailModal.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Stock</p>
                  <p className="font-semibold">{detailModal.stock ?? detailModal.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Batch</p>
                  <p className="font-semibold">{detailModal.batch || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Selling Price</p>
                  <p className="font-semibold text-green-600">₹{detailModal.price}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">MRP</p>
                  <p className="font-semibold text-gray-700">₹{detailModal.mrp || detailModal.price}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Expiry Date</p>
                  <p className="font-semibold">{detailModal.expiryDate || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Distributor</p>
                  <p className="font-semibold">{detailModal.distributor || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button onClick={() => setDetailModal(null)} className="px-5 py-2 bg-gray-200 font-semibold rounded text-gray-800 hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}