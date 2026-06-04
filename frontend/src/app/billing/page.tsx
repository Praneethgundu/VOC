"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Receipt, Search, Printer, Plus, IndianRupee, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getBills, getUnbilledPatients, createBill, updatePaymentStatus } from "@/services/billingService";
import { RefreshCw } from "lucide-react";

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState<any[]>([]);
  const [unbilled, setUnbilled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<any>(null); // holds bill object
  
  // New Bill State
  const [selectedUnbilled, setSelectedUnbilled] = useState<any>(null);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState("Cash");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await getBills();
      setBills(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnbilled = async () => {
    try {
      const data = await getUnbilledPatients();
      setUnbilled(data);
    } catch(e) {
      console.error(e);
    }
  };

  const openNewBillModal = () => {
    fetchUnbilled();
    setSelectedUnbilled(null);
    setBillItems([]);
    setPaymentMode("Cash");
    setShowNewBillModal(true);
  };

  const selectPatientForBill = (patient: any) => {
    setSelectedUnbilled(patient);
    setBillItems(patient.items ? [...patient.items] : []);
  };

  const handleCreateBill = async () => {
    if (!selectedUnbilled) return alert("Select a patient first");
    if (billItems.length === 0) return alert("Add at least one item");
    
    try {
      const payload = {
        patientName: selectedUnbilled.patientName,
        opNumber: selectedUnbilled.opNumber,
        items: billItems,
        paymentMode: paymentMode,
        status: paymentMode === "Pending" ? "Unpaid" : "Paid"
      };
      
      await createBill(payload);
      setShowNewBillModal(false);
      fetchBills();
    } catch (e) {
      console.error(e);
      alert("Failed to create bill");
    }
  };

  const removeItem = (index: number) => {
    setBillItems(prev => prev.filter((_, i) => i !== index));
  };

  const addNewItem = () => {
    setBillItems(prev => [...prev, { serviceName: "New Service", category: "Other", amount: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setBillItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
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
  const pendingBillsCount = bills.filter(b => b.status === "Unpaid").length;

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Billing & Payments" breadcrumb="Generate bills, collect payments and receipts" />
        <main className="flex-1 p-6 space-y-6">

          {/* Summary cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm text-center">
              <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Today's Revenue</p>
              <p className="text-3xl font-bold text-[#16A34A]">₹{totalBilledToday.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm text-center">
              <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Total Collected</p>
              <p className="text-3xl font-bold text-[#1A2332]">₹{collectedToday.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm text-center">
              <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Pending Amount</p>
              <p className="text-3xl font-bold text-[#D97706]">₹{pendingToday.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm text-center">
              <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Pending Bills</p>
              <p className="text-3xl font-bold text-[#D97706]">{pendingBillsCount}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white border border-[#ECECEC] rounded-lg px-3 h-10 w-64 shadow-sm">
                <Search size={14} className="text-[#6B7280] shrink-0" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-[#1A2332] placeholder:text-[#9CA3AF] w-full"
                />
              </div>
              <select className="h-10 px-3 bg-white border border-[#ECECEC] rounded-lg text-sm text-[#6B7280] outline-none shadow-sm">
                <option>-- All Patients --</option>
              </select>
            </div>
            <Button onClick={openNewBillModal} icon={<Plus size={15} />} size="md">New Bill</Button>
          </div>

          {/* Bills table */}
          <div className="bg-white rounded-xl border border-[#ECECEC] shadow-sm">
            <Table>
              <THead>
                <tr>
                  <Th>Bill No.</Th>
                  <Th>OP No.</Th>
                  <Th>Patient</Th>
                  <Th>Date</Th>
                  <Th>Total</Th>
                  <Th>Paid</Th>
                  <Th>Mode</Th>
                  <Th align="center">Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </THead>
              <TBody>
                {filtered.map((b, i) => (
                  <Tr key={b.id} index={i}>
                    <Td><span className="font-mono text-[13px] font-bold text-[#E12D45]">{b.id}</span></Td>
                    <Td><span className="font-mono text-[13px] text-[#1A2332]">{b.opNumber || b.op}</span></Td>
                    <Td><span className="font-medium text-[#1A2332]">{b.patientName || b.patient}</span></Td>
                    <Td><span className="text-[13px] text-[#6B7280]">{new Date(b.date).toISOString().split('T')[0]}</span></Td>
                    <Td><span className="font-bold text-[#1A2332]">₹{(b.total || 0).toLocaleString("en-IN")}</span></Td>
                    <Td><span className="font-bold text-[#16A34A]">₹{b.status === "Paid" ? (b.total || 0).toLocaleString("en-IN") : "0"}</span></Td>
                    <Td><span className="text-[13px] text-[#6B7280]">{b.paymentMode || (b.status === "Paid" ? "Cash" : "Pending")}</span></Td>
                    <Td align="center">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        b.status === "Paid" ? "text-[#16A34A] bg-[#F0FDF4]" : "text-[#D97706] bg-[#FFFBEB]"
                      }`}>
                        {b.status || "PENDING"}
                      </span>
                    </Td>
                    <Td align="right">
                      <button
                        onClick={() => setShowReceiptModal(b)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#ECECEC] text-[#1A2332] text-[11px] font-bold hover:bg-gray-50 transition-colors ml-auto shadow-sm"
                      >
                        <Receipt size={12} />
                        Receipt
                      </button>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
        </main>
      </div>

      {/* NEW BILL MODAL */}
      {showNewBillModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl flex-col md:flex-row">
            
            {/* Left Panel: Unbilled */}
            <div className="w-[300px] border-r border-[#ECECEC] bg-[#FDF8F8] flex flex-col">
              <div className="p-4 border-b border-[#ECECEC]">
                <h3 className="font-bold text-[#800020] text-[14px]">UNBILLED PATIENTS</h3>
                <p className="text-[11px] text-[#6B7280]">Select a patient to bill</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {unbilled.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 mt-4">No unbilled patients</p>
                ) : (
                  unbilled.map((p, idx) => (
                    <div 
                      key={idx}
                      onClick={() => selectPatientForBill(p)}
                      className={`p-3 rounded-xl border cursor-pointer bg-white shadow-sm transition-all ${
                        selectedUnbilled?.opNumber === p.opNumber ? "border-[#E12D45] ring-1 ring-[#E12D45]" : "border-[#ECECEC] hover:border-gray-300"
                      }`}
                    >
                      <h4 className="font-bold text-[#1A2332] text-[13px]">{p.patientName}</h4>
                      <p className="text-[11px] text-[#6B7280]">{p.opNumber} • {p.department}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge status="error">WAITING</Badge>
                        <span className="font-bold text-[#800020]">₹{p.total}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel: Invoice Builder */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-5 border-b border-[#ECECEC] flex items-center gap-2">
                <Receipt className="text-[#800020]" size={20} />
                <h2 className="text-xl font-bold text-[#1A2332]">Create New Bill</h2>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">OP Number</label>
                    <input type="text" readOnly value={selectedUnbilled?.opNumber || ""} className="w-full h-10 px-3 border border-[#ECECEC] rounded-lg bg-gray-50 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Patient Name</label>
                    <input type="text" readOnly value={selectedUnbilled?.patientName || ""} className="w-full h-10 px-3 border border-[#ECECEC] rounded-lg bg-gray-50 text-sm" />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-[#1A2332]">Bill Items</h4>
                  <button onClick={addNewItem} className="text-[#2563EB] text-[12px] font-bold hover:underline">+ Add Item</button>
                </div>

                <div className="space-y-3 mb-6">
                  {billItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input 
                        type="text" 
                        value={item.serviceName}
                        onChange={(e) => updateItem(idx, "serviceName", e.target.value)}
                        className="flex-1 h-10 px-3 border border-[#ECECEC] rounded-lg text-sm" 
                        placeholder="Service name"
                      />
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateItem(idx, "amount", Number(e.target.value))}
                        className="w-24 h-10 px-3 border border-[#ECECEC] rounded-lg text-sm text-right" 
                        placeholder="Amount"
                      />
                      <button onClick={() => removeItem(idx)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {billItems.length === 0 && <p className="text-sm text-gray-500">No items added yet.</p>}
                </div>

                <div className="bg-[#800020] rounded-xl p-5 flex justify-between items-center text-white shadow-sm mb-6">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="text-3xl font-bold">₹{billItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="mb-6">
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-2">Payment Mode</label>
                  <div className="flex gap-3">
                    {["Cash", "Card", "UPI", "Pending"].map(mode => (
                      <button 
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`px-5 py-2 rounded-full text-sm font-bold border transition-colors ${
                          paymentMode === mode 
                            ? "bg-[#800020] text-white border-[#800020]" 
                            : "bg-white text-[#6B7280] border-[#ECECEC] hover:border-gray-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-[#ECECEC] flex gap-3">
                <button 
                  onClick={handleCreateBill}
                  className="flex-1 h-12 bg-[#E12D45] text-white font-bold rounded-lg hover:bg-[#C82239] shadow-sm transition-colors"
                >
                  Save & Generate Bill
                </button>
                <button 
                  onClick={() => setShowNewBillModal(false)}
                  className="px-6 h-12 bg-white text-[#1A2332] font-bold rounded-lg border border-[#ECECEC] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl p-8 flex flex-col">
            <div className="text-center mb-6 border-b border-[#ECECEC] pb-4">
              <h2 className="text-2xl font-bold text-[#800020]">VOC Orthopaedic Hospital</h2>
              <p className="text-sm text-[#6B7280] mt-1">Main Road, Kavali — Ph: 0861-XXXXXX</p>
              <h3 className="mt-4 font-bold tracking-widest text-[#1A2332]">RECEIPT</h3>
            </div>
            
            <div className="space-y-2 text-[13px] mb-6">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Bill No.</span>
                <span className="font-bold text-[#1A2332]">{showReceiptModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Patient</span>
                <span className="font-bold text-[#1A2332]">{showReceiptModal.patientName || showReceiptModal.patient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">OP No.</span>
                <span className="font-bold text-[#1A2332]">{showReceiptModal.opNumber || showReceiptModal.op}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Date</span>
                <span className="font-bold text-[#1A2332]">{new Date(showReceiptModal.date).toISOString().split('T')[0]}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-[#ECECEC] py-4 mb-6 space-y-2">
              {showReceiptModal.items && showReceiptModal.items.length > 0 ? (
                showReceiptModal.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[13px]">
                    <span className="text-[#1A2332]">{item.serviceName}</span>
                    <span className="font-bold text-[#1A2332]">₹{item.amount}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#1A2332]">Consultation Fee</span>
                    <span className="font-bold text-[#1A2332]">₹{showReceiptModal.consultation || 0}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#1A2332]">Pharmacy Charges</span>
                    <span className="font-bold text-[#1A2332]">₹{showReceiptModal.pharmacy || 0}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#1A2332]">Lab Charges</span>
                    <span className="font-bold text-[#1A2332]">₹{showReceiptModal.lab || 0}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xl font-bold text-[#1A2332]">TOTAL</span>
                <p className="text-[11px] text-[#6B7280] mt-1">Payment: {showReceiptModal.paymentMode || (showReceiptModal.status === "Paid" ? "Cash" : "Pending")}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#800020]">₹{showReceiptModal.total.toLocaleString("en-IN")}</span>
                <p className={`text-[12px] font-bold mt-1 ${showReceiptModal.status === "Paid" ? "text-[#16A34A]" : "text-[#D97706]"}`}>
                  {showReceiptModal.status || "PENDING"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 h-12 bg-[#E12D45] text-white font-bold rounded-lg hover:bg-[#C82239] transition-colors"
              >
                Print
              </button>
              <button 
                onClick={() => setShowReceiptModal(null)}
                className="flex-1 h-12 bg-white text-[#1A2332] font-bold rounded-lg border border-[#ECECEC] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
