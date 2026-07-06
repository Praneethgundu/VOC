"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Search, Printer, Plus, IndianRupee, Trash2, Receipt, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { getBills, getUnbilledPatients, createBill, updatePaymentStatus, deleteBill } from "@/services/billingService";
import { getPatients } from "@/services/patientService";
import { RefreshCw, Download } from "lucide-react";

export default function BillingPage() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bills, setBills] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [unbilled, setUnbilled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(todayStr);
  
  // Modals
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<any>(null); // holds bill object
  
  const [selectedUnbilled, setSelectedUnbilled] = useState<any>(null);
  const [unbilledSearch, setUnbilledSearch] = useState("");
  const [billItems, setBillItems] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Pay");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [billError, setBillError] = useState<string>('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const [billsData, patientsData] = await Promise.all([
        getBills(),
        getPatients()
      ]);
      setBills(billsData);
      setPatients(patientsData);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      await deleteBill(id);
      fetchBills();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete bill");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === "Paid" || newStatus === "Pay") {
      try {
        await updatePaymentStatus(id, "Paid");
        fetchBills();
      } catch (e) {
        alert("Failed to update status");
      }
    }
  };

  const downloadReceipt = () => {
    if (!showReceiptModal) return;
    const bill = showReceiptModal;
    
    let itemsText = "";
    if (bill.items && bill.items.length > 0) {
      bill.items.forEach((item: any) => {
        itemsText += `${item.serviceName.padEnd(30)} Rs.${item.amount}\n`;
      });
    } else {
      itemsText += `Consultation Fee`.padEnd(30) + ` Rs.${bill.consultation || 0}\n`;
      itemsText += `Pharmacy Charges`.padEnd(30) + ` Rs.${bill.pharmacy || 0}\n`;
      itemsText += `Lab Charges`.padEnd(30) + ` Rs.${bill.lab || 0}\n`;
    }

    const patientName = patients.find(p => p.opNumber === bill.opNumber)?.fullName || bill.patientName || bill.patient || "Unknown";

    const receiptContent = `
VOC Orthopaedic Hospital
House No 23 HIGA, Karur Vysya Bank Road, Gokul Nagar, A. S. Rao Nagar, Secunderabad, Telangana 500062
========================================
RECEIPT
========================================
Bill No. : ${bill.id || bill._id}
Patient  : ${patientName}
OP No.   : ${bill.opNumber || bill.op}
Date     : ${bill.date ? new Date(bill.date).toISOString().split('T')[0] : "N/A"}
========================================
ITEMS:
${itemsText}
========================================
TOTAL    : Rs.${bill.total}
PAYMENT  : ${bill.paymentMode || (bill.status === "Paid" ? "Cash" : "Pending")}
STATUS   : ${bill.status === "Paid" ? "COMPLETED" : "PENDING"}
========================================
Thank you!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${bill.id || bill._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openNewBillModal = () => {
    fetchUnbilled();
    setSelectedUnbilled(null);
    setBillItems([]);
    setPaymentMode("Cash");
    setPaymentStatus("Pay");
    setUnbilledSearch("");
    setBillError('');
    setShowNewBillModal(true);
  };

  const selectPatientForBill = (patient: any) => {
    setSelectedUnbilled(patient);
    setBillItems(patient.items ? [...patient.items] : []);
  };

  const handleCreateBill = async () => {
    setBillError('');
    if (!selectedUnbilled) {
      setBillError("Select a patient first");
      return;
    }
    if (billItems.length === 0) {
      setBillError("Add at least one item to the bill");
      return;
    }
    
    const invalidItems = billItems.filter(item => !item.serviceName?.trim() || isNaN(Number(item.amount)) || Number(item.amount) < 0);
    if (invalidItems.length > 0) {
      setBillError("Please ensure all items have a valid name and amount >= 0");
      return;
    }
    
    try {
      const payload = {
        patientName: selectedUnbilled.patientName,
        opNumber: selectedUnbilled.opNumber,
        items: billItems,
        paymentMode: paymentMode,
        status: paymentStatus === "Pending" ? "Unpaid" : "Paid"
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

  const handleDragStart = (e: React.DragEvent, patient: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(patient));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        const patient = JSON.parse(data);
        selectPatientForBill(patient);
      }
    } catch (err) {
      console.error("Failed to drop patient data", err);
    }
  };

  const searchLower = search.toLowerCase();
  const filtered = bills.filter(
    (b) => {
      if (statusFilter !== "All" && b.status !== statusFilter) return false;
      if (filterDate) {
        try {
          if (!b.date || !new Date(b.date).toISOString().startsWith(filterDate)) return false;
        } catch {
          return false;
        }
      }
      const pName = patients.find(p => p.opNumber === b.opNumber)?.fullName || b.patientName || b.patient || "";
      return pName.toLowerCase().includes(searchLower) ||
             (b.opNumber || b.op || "").toString().toLowerCase().includes(searchLower) ||
             (b.id || b._id || "").toString().toLowerCase().includes(searchLower);
    }
  );

  const selectedDateBills = bills.filter((b) => {
    try {
      return b.date && new Date(b.date).toISOString().startsWith(filterDate);
    } catch {
      return false;
    }
  });
  const totalBilledToday = selectedDateBills.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const collectedToday = selectedDateBills.filter(b => b.status === "Paid").reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const pendingToday = selectedDateBills.filter(b => b.status === "Unpaid").reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const pendingBillsCount = selectedDateBills.filter(b => b.status === "Unpaid").length;

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Billing & Payments" breadcrumb="Generate bills, collect payments and receipts" />
        <main className="flex-1 p-6 space-y-6">

          {/* Summary cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            <div 
              onClick={() => setStatusFilter("All")}
              className={`bg-white rounded-xl p-5 shadow-sm text-center cursor-pointer transition-all hover:scale-105 active:scale-95 border ${statusFilter === "All" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]"}`}
            >
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                {filterDate === todayStr ? "Today's Revenue" : "Revenue"}
              </p>
              <p className="text-3xl font-bold text-[#059669]">₹{totalBilledToday.toLocaleString("en-IN")}</p>
            </div>
            <div 
              onClick={() => setStatusFilter("Paid")}
              className={`bg-white rounded-xl p-5 shadow-sm text-center cursor-pointer transition-all hover:scale-105 active:scale-95 border ${statusFilter === "Paid" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]"}`}
            >
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Total Collected</p>
              <p className="text-3xl font-bold text-[#1E293B]">₹{collectedToday.toLocaleString("en-IN")}</p>
            </div>
            <div 
              onClick={() => setStatusFilter("Unpaid")}
              className={`bg-white rounded-xl p-5 shadow-sm text-center cursor-pointer transition-all hover:scale-105 active:scale-95 border ${statusFilter === "Unpaid" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]"}`}
            >
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Pending Amount</p>
              <p className="text-3xl font-bold text-[#92400E]">₹{pendingToday.toLocaleString("en-IN")}</p>
            </div>
            <div 
              onClick={() => setStatusFilter("Unpaid")}
              className={`bg-white rounded-xl p-5 shadow-sm text-center cursor-pointer transition-all hover:scale-105 active:scale-95 border ${statusFilter === "Unpaid" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]"}`}
            >
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Pending Bills</p>
              <p className="text-3xl font-bold text-[#92400E]">{pendingBillsCount}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg px-3 h-10 w-64 shadow-sm">
                <Search size={14} className="text-[#64748B] shrink-0" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-[#1E293B] placeholder:text-[#64748B] w-full"
                />
              </div>
              <select className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] outline-none shadow-sm">
                <option>-- All Patients --</option>
              </select>
              <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-gray-700 shadow-sm relative">
                <CalendarDays size={16} className="text-[#2563EB]" />
                <input 
                  type="date"
                  value={filterDate}
                  max={todayStr}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="outline-none text-gray-700 bg-transparent font-semibold cursor-pointer w-[125px]"
                  title="Filter by Date"
                />
              </div>
            </div>
            <Button onClick={openNewBillModal} icon={<Plus size={15} />} size="md">New Bill</Button>
          </div>

          {/* Bills table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            <Table>
              <THead>
                <tr>
                  <Th>Bill No.</Th>
                  <Th>OP No.</Th>
                  <Th>Patient</Th>
                  <Th>Date</Th>
                  <Th>Time</Th>
                  <Th>Total</Th>
                  <Th>Paid</Th>
                  <Th>Mode</Th>
                  <Th align="center">Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </THead>
              <TBody>
                {filtered.map((b, i) => (
                  <Tr key={b.id || b._id} index={i}>
                    <Td><span className="font-mono text-[13px] font-bold text-[#2563EB]">{b.id || b._id || "N/A"}</span></Td>
                    <Td><span className="font-mono text-[13px] text-[#1E293B]">{b.opNumber || b.op}</span></Td>
                    <Td><span className="font-medium text-[#1E293B]">
                      {patients.find(p => p.opNumber === b.opNumber)?.fullName || b.patientName || b.patient || "Unknown"}
                    </span></Td>
                    <Td><span className="text-[13px] text-[#64748B]">{b.date && !isNaN(new Date(b.date).getTime()) ? new Date(b.date).toISOString().split('T')[0] : "N/A"}</span></Td>
                    <Td><span className="text-[13px] text-[#64748B]">{b.date && !isNaN(new Date(b.date).getTime()) ? new Date(b.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A"}</span></Td>
                    <Td><span className="font-bold text-[#1E293B]">₹{(b.total || 0).toLocaleString("en-IN")}</span></Td>
                    <Td><span className="font-bold text-[#059669]">₹{b.status === "Paid" ? (b.total || 0).toLocaleString("en-IN") : "0"}</span></Td>
                    <Td><span className="text-[13px] text-[#64748B]">{b.paymentMode || (b.status === "Paid" ? "Cash" : "Pending")}</span></Td>
                    <Td align="center">
                      {b.status === "Paid" ? (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded text-[#059669] bg-[#ECFDF5]">
                          PAID
                        </span>
                      ) : (
                        <select
                          className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] outline-none cursor-pointer"
                          value="Pending"
                          onChange={(e) => handleStatusChange(b.id || b._id, e.target.value)}
                        >
                          <option value="Pending">PENDING</option>
                          <option value="Pay">PAY</option>
                        </select>
                      )}
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowReceiptModal(b)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E2E8F0] text-[#1E293B] text-[11px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <Receipt size={12} />
                          Receipt
                        </button>
                        <button
                          onClick={() => handleDelete(b.id || b._id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 size={16} />
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

      {/* NEW BILL MODAL */}
      {showNewBillModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl flex-col md:flex-row">
            
            {/* Left Panel: Unbilled */}
            <div className="w-[300px] border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col">
              <div className="p-4 border-b border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] text-[14px]">UNBILLED PATIENTS</h3>
                <p className="text-[11px] text-[#64748B]">Select a patient to bill</p>
                <div className="mt-2">
                  <input type="text" placeholder="Search OP or Name..." value={unbilledSearch} onChange={(e) => setUnbilledSearch(e.target.value)} className="w-full h-8 px-2 border border-[#E2E8F0] rounded text-sm outline-none bg-white focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {unbilled.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 mt-4">No unbilled patients</p>
                ) : (
                  unbilled.filter(u => unbilledSearch ? (u.patientName?.toLowerCase().includes(unbilledSearch.toLowerCase()) || u.opNumber?.toLowerCase().includes(unbilledSearch.toLowerCase())) : true).map((p, idx) => (
                    <div 
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p)}
                      onClick={() => selectPatientForBill(p)}
                      className={`p-3 rounded-xl border cursor-pointer bg-white shadow-sm transition-all ${
                        selectedUnbilled?.opNumber === p.opNumber ? "border-[#2563EB] ring-1 ring-[#2563EB]" : "border-[#E2E8F0] hover:border-gray-300"
                      } active:scale-95`}
                    >
                      <div>
                        <p className="text-[13px] font-bold text-[#1E293B]">{p.patientName}</p>
                        <p className="text-[11px] text-[#64748B]">{p.opNumber} • {p.department}</p>
                        {p.complaint && p.complaint !== "N/A" && (
                          <p className="text-[11px] font-semibold text-[#0F172A] mt-0.5">{p.complaint}</p>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge status="error">WAITING</Badge>
                        <span className="font-bold text-[#0F172A]">₹{p.total}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel: Invoice Builder */}
            <div 
              className={`flex-1 flex flex-col transition-colors duration-300 ${isDraggingOver ? "bg-red-50 border-2 border-dashed border-[#2563EB]" : "bg-white"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-2">
                <Receipt className="text-[#0F172A]" size={20} />
                <h2 className="text-xl font-bold text-[#1E293B]">Create New Bill {isDraggingOver && <span className="text-sm font-normal text-[#2563EB] animate-pulse ml-2">Drop to auto-fill</span>}</h2>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6 relative">
                  {isDraggingOver && (
                    <div className="absolute inset-0 bg-[#2563EB]/5 border-2 border-[#2563EB] border-dashed rounded-lg flex items-center justify-center z-10 pointer-events-none">
                       <span className="font-bold text-[#2563EB]">Drop Patient Here</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">OP Number</label>
                    <input 
                      type="text" 
                      value={selectedUnbilled?.opNumber || ""} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedUnbilled((prev: any) => ({ ...(prev || {}), opNumber: val }));
                        if (val.trim()) {
                          const searchOp = val.trim().toLowerCase();
                          const p = patients.find(p => p.opNumber && p.opNumber.trim().toLowerCase() === searchOp);
                          const unbilledPatient = unbilled.find(u => u.opNumber && u.opNumber.trim().toLowerCase() === searchOp);
                          if (unbilledPatient) {
                            selectPatientForBill(unbilledPatient);
                          } else if (p) {
                            setSelectedUnbilled((prev: any) => ({ ...(prev || {}), patientName: p.fullName || p.patientName || "Unknown Name" }));
                          }
                        }
                      }}
                      className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm bg-white" 
                      placeholder="Enter OP Number"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">Patient Name</label>
                    <input 
                      type="text" 
                      value={selectedUnbilled?.patientName || ""} 
                      onChange={(e) => setSelectedUnbilled((prev: any) => ({ ...(prev || {}), patientName: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg bg-white text-sm" 
                      placeholder="Patient Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">Bill Number</label>
                    <input type="text" readOnly value="Auto-generated" className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg bg-gray-50 text-sm text-gray-400 italic" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">Date</label>
                    <input type="text" readOnly value={new Date().toLocaleDateString('en-GB')} className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg bg-gray-50 text-sm text-gray-500" />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-[#1E293B]">Bill Items</h4>
                  <button onClick={addNewItem} className="text-[#2563EB] text-[12px] font-bold hover:underline">+ Add Item</button>
                </div>

                <div className="space-y-3 mb-6">
                  {billItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input 
                        type="text" 
                        value={item.serviceName}
                        onChange={(e) => updateItem(idx, "serviceName", e.target.value)}
                        className="flex-1 h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm" 
                        placeholder="Service name"
                      />
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateItem(idx, "amount", Number(e.target.value))}
                        className="w-24 h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm text-right" 
                        placeholder="Amount"
                      />
                      <button onClick={() => removeItem(idx)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {billItems.length === 0 && <p className="text-sm text-gray-500">No items added yet.</p>}
                </div>

                <div className="bg-[#0F172A] rounded-xl p-5 flex justify-between items-center text-white shadow-sm mb-6">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="text-3xl font-bold">₹{billItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-2">Payment Mode</label>
                    <select 
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-2">Payment Status</label>
                    <select 
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] outline-none"
                    >
                      <option value="Pay">Pay (Completed)</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                {billError && <p className="text-[12px] text-[#2563EB] font-medium mb-4">{billError}</p>}
              </div>

              <div className="p-5 border-t border-[#E2E8F0] flex gap-3">
                <button 
                  onClick={handleCreateBill}
                  className="flex-1 h-12 bg-[#2563EB] text-white font-bold rounded-lg hover:bg-[#1D4ED8] shadow-sm transition-colors"
                >
                  Save & Generate Bill
                </button>
                <button 
                  onClick={() => setShowNewBillModal(false)}
                  className="px-6 h-12 bg-white text-[#1E293B] font-bold rounded-lg border border-[#E2E8F0] hover:bg-gray-50 transition-colors"
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
            <div className="text-center mb-6 border-b border-[#E2E8F0] pb-4">
              <h2 className="text-2xl font-bold text-[#0F172A]">VOC Orthopaedic Hospital</h2>
              <p className="text-sm text-[#64748B] mt-1">House No 23 HIGA, Karur Vysya Bank Road, Gokul Nagar, A. S. Rao Nagar, Secunderabad, Telangana 500062</p>
              <h3 className="mt-4 font-bold tracking-widest text-[#1E293B]">RECEIPT</h3>
            </div>
            
            <div className="space-y-2 text-[13px] mb-6">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Bill No.</span>
                <span className="font-bold text-[#1E293B]">{showReceiptModal.id || showReceiptModal._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Patient</span>
                <span className="font-bold text-[#1E293B]">
                  {patients.find(p => p.opNumber === showReceiptModal.opNumber)?.fullName || showReceiptModal.patientName || showReceiptModal.patient || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">OP No.</span>
                <span className="font-bold text-[#1E293B]">{showReceiptModal.opNumber || showReceiptModal.op}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Date</span>
                <span className="font-bold text-[#1E293B]">{showReceiptModal.date && !isNaN(new Date(showReceiptModal.date).getTime()) ? new Date(showReceiptModal.date).toISOString().split('T')[0] : "N/A"}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-[#E2E8F0] py-4 mb-6 space-y-2">
              {showReceiptModal.items && showReceiptModal.items.length > 0 ? (
                showReceiptModal.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[13px]">
                    <span className="text-[#1E293B]">{item.serviceName}</span>
                    <span className="font-bold text-[#1E293B]">₹{item.amount}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#1E293B]">Consultation Fee</span>
                    <span className="font-bold text-[#1E293B]">₹{showReceiptModal.consultation || 0}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#1E293B]">Pharmacy Charges</span>
                    <span className="font-bold text-[#1E293B]">₹{showReceiptModal.pharmacy || 0}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#1E293B]">Lab Charges</span>
                    <span className="font-bold text-[#1E293B]">₹{showReceiptModal.lab || 0}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xl font-bold text-[#1E293B]">TOTAL</span>
                <p className="text-[11px] text-[#64748B] mt-1">Payment: {showReceiptModal.paymentMode || (showReceiptModal.status === "Paid" ? "Cash" : "Pending")}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#0F172A]">₹{showReceiptModal.total.toLocaleString("en-IN")}</span>
                <p className={`text-[12px] font-bold mt-1 ${showReceiptModal.status === "Paid" ? "text-[#059669]" : "text-[#92400E]"}`}>
                  {showReceiptModal.status || "PENDING"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={downloadReceipt}
                className="flex items-center justify-center gap-2 h-12 bg-gray-100 text-[#1E293B] font-bold rounded-lg hover:bg-gray-200 transition-colors px-4"
                title="Download Receipt"
              >
                <Download size={18} />
              </button>
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 h-12 bg-[#2563EB] text-white font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                Print
              </button>
              <button 
                onClick={() => setShowReceiptModal(null)}
                className="flex-1 h-12 bg-white text-[#1E293B] font-bold rounded-lg border border-[#E2E8F0] hover:bg-gray-50 transition-colors"
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
