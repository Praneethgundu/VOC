"use client";

import { useEffect, useState } from "react";
import { getMedicines } from "@/services/pharmacyService";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Search, RefreshCw, AlertTriangle } from "lucide-react";

function stockStatus(qty: number): { label: string; status: "success" | "warning" | "error" } {
  if (qty <= 0) return { label: "Out of Stock", status: "error" };
  if (qty < 20) return { label: "Low Stock", status: "warning" };
  return { label: "In Stock", status: "success" };
}

export default function MedicineTable() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [dispenseMedicineData, setDispenseMedicineData] = useState<any>(null);
  const [dispenseForm, setDispenseForm] = useState({ opNumber: "", quantity: 1, amount: 0 });

  useEffect(() => { fetchMedicines(); }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch { /* silence */ }
    finally { setLoading(false); }
  };

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
      className="bg-white rounded-xl border border-[#ECECEC] p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-heading">Medicine Inventory</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">{medicines.length} medicines on record</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#FDF8F8] border border-[#ECECEC] rounded-lg px-3 h-9">
            <Search size={13} className="text-[#6B7280] shrink-0" />
            <input
              type="text"
              placeholder="Search medicine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-[13px] text-[#1A2332] placeholder:text-[#9CA3AF] w-40"
            />
          </div>
          <button
            onClick={fetchMedicines}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#ECECEC] text-[#6B7280] hover:border-[#E12D45] hover:text-[#E12D45] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-[#6B7280]">
          <RefreshCw size={24} className="animate-spin text-[#E12D45]" />
          <p className="text-[13px]">Loading inventory…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[#6B7280] text-[13px]">No medicines found.</div>
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Medicine ID</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th align="center">Qty</Th>
              <Th align="right">Price</Th>
              <Th>Expiry Date</Th>
              <Th align="center">Stock Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {filtered.map((m, i) => {
              const qty = Number(m.quantity ?? 0);
              const stock = stockStatus(qty);
              return (
                <Tr key={m.medicineId ?? i} index={i}>
                  <Td>
                    <span className="font-mono text-[13px] font-semibold text-[#800020]">{m.medicineId}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {qty < 20 && <AlertTriangle size={13} className="text-[#F59E0B] shrink-0" />}
                      <span className="font-medium text-[#1A2332]">{m.medicineName}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className="px-2 py-0.5 bg-[#FDF8F8] border border-[rgba(128,0,32,0.1)] text-[#800020] text-[11px] font-semibold rounded-md">
                      {m.category}
                    </span>
                  </Td>
                  <Td align="center">
                    <span className="font-mono font-bold text-[14px]">{m.quantity}</span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono text-[14px] font-semibold text-[#16A34A]">₹{Number(m.price).toFixed(2)}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[13px] text-[#6B7280]">{m.expiryDate}</span>
                  </Td>
                  <Td align="center">
                    <Badge status={stock.status}>{stock.label}</Badge>
                  </Td>
                  <Td align="right">
                    <button
                      onClick={() => {
                        setDispenseMedicineData(m);
                        setDispenseForm({ opNumber: "", quantity: 1, amount: Number(m.price) });
                      }}
                      disabled={qty <= 0}
                      className="px-3 py-1 bg-[#16A34A] text-white text-[11px] font-bold rounded hover:bg-[#15803D] disabled:opacity-50"
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
            <h3 className="text-lg font-bold mb-4 text-[#1A2332]">Dispense Medicine</h3>
            <div className="mb-4 text-[13px] text-[#6B7280]">
              <p>Medicine: <strong className="text-[#1A2332]">{dispenseMedicineData.medicineName}</strong></p>
              <p>Available: <strong className="text-[#1A2332]">{dispenseMedicineData.quantity}</strong></p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold mb-1">Patient OP Number</label>
                <input
                  type="text"
                  value={dispenseForm.opNumber}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, opNumber: e.target.value })}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                  placeholder="e.g. OP1234"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={dispenseMedicineData.quantity}
                  value={dispenseForm.quantity}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: Number(e.target.value), amount: Number(e.target.value) * Number(dispenseMedicineData.price) })}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  readOnly
                  value={dispenseForm.amount}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm bg-gray-50"
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
                className="px-4 py-2 bg-[#E12D45] text-white text-sm font-bold rounded"
              >
                Confirm Dispense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}