"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Receipt, Search, Printer, Plus, IndianRupee } from "lucide-react";
import { useState, useEffect } from "react";
import { getBills } from "@/services/billingService";
import { RefreshCw } from "lucide-react";

const statusMap: Record<string, "success" | "error" | "default"> = {
  Paid: "success",
  Unpaid: "error",
  Refunded: "default",
};

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [newBill, setNewBill] = useState({ patientName: "", opNumber: "", consultation: 0, pharmacy: 0, lab: 0 });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await getBills();
      setBills(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async () => {
    try {
      const { createBill } = await import("@/services/billingService");
      await createBill(newBill);
      setShowNewBillModal(false);
      setNewBill({ patientName: "", opNumber: "", consultation: 0, pharmacy: 0, lab: 0 });
      fetchBills();
    } catch (e) {
      console.error(e);
      alert("Failed to create bill");
    }
  };

  const filtered = bills.filter(
    (b) =>
      b.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      b.opNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.id?.toLowerCase().includes(search.toLowerCase())
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBills = bills.filter((b) => b.date?.startsWith(todayStr));
  const totalBilledToday = todayBills.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const collectedToday = todayBills.filter(b => b.status === "Paid").reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const pendingToday = todayBills.filter(b => b.status === "Unpaid").reduce((acc, b) => acc + (Number(b.total) || 0), 0);

  const summaryCards = [
    { label: "Total Billed Today", value: `₹${totalBilledToday}`, color: "#800020", bg: "#FFF0F2" },
    { label: "Collected", value: `₹${collectedToday}`, color: "#16A34A", bg: "#F0FDF4" },
    { label: "Pending", value: `₹${pendingToday}`, color: "#D97706", bg: "#FFFBEB" },
    { label: "Bills Issued", value: todayBills.length.toString(), color: "#2563EB", bg: "#EFF6FF" },
  ];

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Billing" breadcrumb="Finance" />
        <main className="flex-1 p-6 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Billing</h1>
              <p className="text-[#6B7280] text-[13px] mt-1">Manage patient bills and payments</p>
            </div>
            <Button onClick={() => setShowNewBillModal(true)} icon={<Plus size={15} />} size="md">New Bill</Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {summaryCards.map((c) => (
              <div
                key={c.label}
                className="bg-white rounded-xl border border-[#ECECEC] p-5 flex flex-col gap-3"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                  <IndianRupee size={18} style={{ color: c.color }} />
                </div>
                <div>
                  <p className="card-value" style={{ color: c.color }}>{c.value}</p>
                  <p className="text-[12px] text-[#6B7280] mt-1">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bills table */}
          <div
            className="bg-white rounded-xl border border-[#ECECEC] p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-heading">Recent Bills</h2>
                <p className="text-[12px] text-[#6B7280] mt-0.5">{filtered.length} bills found</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#FDF8F8] border border-[#ECECEC] rounded-lg px-3 h-9">
                  <Search size={13} className="text-[#6B7280] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search bill…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-[13px] text-[#1A2332] placeholder:text-[#9CA3AF] w-36"
                  />
                </div>
                <button
                  onClick={fetchBills}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#ECECEC] text-[#6B7280] hover:border-[#E12D45] hover:text-[#E12D45] transition-colors"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#ECECEC] text-[#6B7280] text-[13px] font-medium hover:border-[#E12D45] hover:text-[#E12D45] transition-colors">
                  <Printer size={13} /> Print
                </button>
              </div>
            </div>

            <Table>
              <THead>
                <tr>
                  <Th>Bill ID</Th>
                  <Th>Patient</Th>
                  <Th>OP Number</Th>
                  <Th>Date</Th>
                  <Th align="right">Consult</Th>
                  <Th align="right">Pharmacy</Th>
                  <Th align="right">Lab</Th>
                  <Th align="right">Total</Th>
                  <Th align="center">Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </THead>
              <TBody>
                {filtered.map((b, i) => (
                  <Tr key={b.id} index={i}>
                    <Td>
                      <span className="font-mono text-[13px] font-semibold text-[#800020]">{b.id}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E12D45] to-[#800020] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {b.patient.charAt(0)}
                        </div>
                        <span className="font-medium text-[#1A2332]">{b.patient}</span>
                      </div>
                    </Td>
                    <Td><span className="font-mono text-[12px] text-[#6B7280]">{b.op}</span></Td>
                    <Td><span className="font-mono text-[12px] text-[#6B7280]">{b.date}</span></Td>
                    <Td align="right"><span className="font-mono text-[13px]">₹{b.consultation}</span></Td>
                    <Td align="right"><span className="font-mono text-[13px]">₹{b.pharmacy}</span></Td>
                    <Td align="right"><span className="font-mono text-[13px]">₹{b.lab}</span></Td>
                    <Td align="right">
                      <span className="font-mono text-[14px] font-bold text-[#800020]">₹{b.total.toLocaleString("en-IN")}</span>
                    </Td>
                    <Td align="center">
                      <select
                        value={b.status || "Unpaid"}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const { updatePaymentStatus } = await import("@/services/billingService");
                            await updatePaymentStatus(b.id, newStatus);
                            fetchBills();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className={`text-[11px] font-bold border border-[#ECECEC] rounded px-2 py-1 ${
                          b.status === "Paid" ? "bg-[#F0FDF4] text-[#16A34A]" :
                          b.status === "Unpaid" ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert(`Showing details for Bill ${b.id}\nTotal: ₹${b.total}`)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#FDF8F8] border border-[#ECECEC] text-[#2563EB] text-[11px] font-semibold hover:border-blue-200 hover:text-blue-700 transition-colors"
                        >
                          <Receipt size={12} />
                          Invoice
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#FFF0F2] border border-[#FFE0E4] text-[#E12D45] text-[11px] font-semibold hover:bg-[#FFE0E4] transition-colors"
                        >
                          <Printer size={12} />
                          Receipt
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>

        </main>
      </div>

      {showNewBillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px]">
            <h3 className="text-lg font-bold mb-4 text-[#1A2332]">Create New Bill</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={newBill.patientName}
                    onChange={(e) => setNewBill({ ...newBill, patientName: e.target.value })}
                    className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1">OP Number</label>
                  <input
                    type="text"
                    value={newBill.opNumber}
                    onChange={(e) => setNewBill({ ...newBill, opNumber: e.target.value })}
                    className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                    placeholder="e.g. OP1234"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Consultation Charges (₹)</label>
                <input
                  type="number"
                  value={newBill.consultation}
                  onChange={(e) => setNewBill({ ...newBill, consultation: Number(e.target.value) })}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Pharmacy Charges (₹)</label>
                <input
                  type="number"
                  value={newBill.pharmacy}
                  onChange={(e) => setNewBill({ ...newBill, pharmacy: Number(e.target.value) })}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Investigation Charges (₹)</label>
                <input
                  type="number"
                  value={newBill.lab}
                  onChange={(e) => setNewBill({ ...newBill, lab: Number(e.target.value) })}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                />
              </div>
              <div className="pt-4 border-t border-[#ECECEC]">
                <div className="flex justify-between items-center text-[#1A2332] font-bold">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#800020]">₹{newBill.consultation + newBill.pharmacy + newBill.lab}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewBillModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBill}
                className="px-4 py-2 bg-[#E12D45] text-white text-sm font-bold rounded"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
