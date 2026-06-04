"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { getEodReport } from "@/services/reportService";
import { Printer, X, FileText, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import Image from "next/image";

export default function EODReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const data = await getEodReport();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!report) return;
    const text = `*VOC Orthopaedic Hospital*
*END OF DAY REPORT*
Date: ${new Date(report.date).toLocaleDateString("en-GB")}

*EXECUTIVE SUMMARY*
Patients Registered: ${report?.stats?.totalPatients || 0}
Consultations: ${report?.stats?.totalConsultations || 0}
Investigations: ${report?.stats?.totalInvestigations || 0}
Procedures: ${report?.stats?.totalProcedures || 0}
Medicines Dispensed: ${report?.stats?.totalMedicinesDispensed || 0}
Bills Generated: ${report?.stats?.totalBills || 0}

*REVENUE*
Revenue Collected: ₹${report?.stats?.collectedRevenue || 0}
Pending Revenue: ₹${report?.stats?.pendingRevenue || 0}
`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading) return <div className="p-10">Loading EOD Report...</div>;
  if (!report) return <div className="p-10 text-red-500">Failed to load report.</div>;

  const dateStr = new Date(report.date).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      {/* Hide Sidebar during print */}
      <div className="print:hidden">
        <Sidebar />
      </div>
      
      <div className="ml-[248px] print:ml-0 flex-1 flex flex-col min-h-screen print:bg-white">
        <div className="print:hidden">
          <Navbar pageTitle="EOD Report" breadcrumb="Reports" />
        </div>
        
        <main className="flex-1 p-6 print:p-0 flex justify-center">
          {/* Main Report Container */}
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl print:shadow-none print:w-full border border-[#ECECEC] print:border-none p-8 relative">
            
            {/* Action Bar - Hidden on print */}
            <div className="flex justify-between items-center mb-8 print:hidden">
              <div className="flex items-center gap-2 text-[#1A2332]">
                <FileText className="text-[#800020]" />
                <h1 className="text-xl font-bold">End of Day Report</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#E6F4EA] text-[#137333] px-3 py-1 rounded-full text-xs font-semibold">WhatsApp Ready</span>
              </div>
            </div>

            {/* Print Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-2">
                <Image src="/images/logo.jpeg" alt="VOC Logo" width={40} height={40} className="rounded-lg object-cover" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#800020]">VOC Orthopaedic Hospital</h2>
              <p className="text-[#6B7280] text-sm">Main Road, Kavali - Official EOD Report</p>
              <div className="mt-3 inline-block border border-[#800020]/20 text-[#800020] rounded-full px-4 py-1 text-sm font-semibold bg-[#800020]/5">
                {dateStr}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5 relative overflow-hidden">
                <p className="text-[#16A34A] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>💰</span> TODAY'S REVENUE
                </p>
                <p className="text-3xl font-extrabold text-[#16A34A]">₹{(report?.stats?.collectedRevenue || 0).toLocaleString()}</p>
                <p className="text-[#16A34A]/80 text-xs mt-1 font-medium">+{(report?.stats?.paidBills || 0)} bills paid</p>
              </div>

              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-5 relative overflow-hidden">
                <p className="text-[#DC2626] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>⏳</span> PENDING AMOUNT
                </p>
                <p className="text-3xl font-extrabold text-[#DC2626]">₹{(report?.stats?.pendingRevenue || 0).toLocaleString()}</p>
                <p className="text-[#DC2626]/80 text-xs mt-1 font-medium">{(report?.stats?.pendingBills || 0)} bill(s) outstanding</p>
              </div>

              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5 relative overflow-hidden">
                <p className="text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>👥</span> TOTAL PATIENTS
                </p>
                <p className="text-3xl font-extrabold text-[#2563EB]">{(report?.stats?.totalPatients || 0)}</p>
                <p className="text-[#2563EB]/80 text-xs mt-1 font-medium">{(report?.stats?.totalConsultations || 0)} Consultations</p>
              </div>

              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5 relative overflow-hidden">
                <p className="text-[#D97706] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>🔬</span> TESTS / OT
                </p>
                <p className="text-3xl font-extrabold text-[#D97706]">{(report?.stats?.totalInvestigations || 0)} / {(report?.stats?.totalProcedures || 0)}</p>
                <p className="text-[#D97706]/80 text-xs mt-1 font-medium">{(report?.stats?.totalMedicinesDispensed || 0)} Meds Dispensed</p>
              </div>
            </div>

            {/* Department Summary */}
            <div className="mb-6 rounded-xl border border-[#ECECEC] overflow-hidden">
              <div className="bg-[#800020]/5 px-4 py-2 border-b border-[#ECECEC] flex items-center gap-2">
                <FileText size={16} className="text-[#800020]" />
                <h3 className="text-xs font-bold text-[#800020] uppercase tracking-wider">DEPARTMENT SUMMARY</h3>
              </div>
              <div className="bg-white p-4">
                {(report?.departmentSummary || []).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No data</p>
                ) : (
                  <ul className="space-y-3">
                    {(report?.departmentSummary || []).map((dept: any, i: number) => (
                      <li key={i} className="flex justify-between items-center text-sm font-medium border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-[#1A2332]">{dept.department}</span>
                        <span className="text-[#E12D45] bg-[#E12D45]/10 px-2 py-0.5 rounded-md text-xs">{dept.count} PATIENTS</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Patient Wise Detailed Report */}
            <div className="mb-6 rounded-xl border border-[#ECECEC] overflow-hidden">
              <div className="bg-[#800020]/5 px-4 py-2 border-b border-[#ECECEC] flex items-center gap-2">
                <Users size={16} className="text-[#800020]" />
                <h3 className="text-xs font-bold text-[#800020] uppercase tracking-wider">PATIENT-WISE DETAILED REPORT ({(report?.patients || []).length} PATIENTS)</h3>
              </div>
              <div className="bg-[#FDF8F8] p-4 space-y-4">
                {(report?.patients || []).map((p: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-[#1A2332]">{p.patientName}</h4>
                        <p className="text-xs text-[#6B7280]">{p.opNumber} · {p.age || '-'} / {p.gender || '-'} · {p.department}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          p.status === 'Completed' ? 'bg-[#E6F4EA] text-[#137333]' : 
                          p.status === 'Waiting' ? 'bg-[#FFF3E0] text-[#E65100]' : 
                          'bg-[#E3F2FD] text-[#1976D2]'
                        }`}>
                          {p.status}
                        </div>
                        <p className="text-[10px] text-[#6B7280]">Dr: {p.doctor}</p>
                        <p className="text-sm font-bold text-[#16A34A]">₹{p.collectedAmount} <span className="text-gray-400 font-normal">/ ₹{p.collectedAmount + p.pendingAmount}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        {/* Bills */}
                        <h5 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1 mb-2">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-sm"></span> BILLS
                        </h5>
                        {p.bills.length === 0 ? <p className="text-xs text-gray-500 mb-4">No bills</p> : (
                          <div className="mb-4">
                            {p.bills.map((b: any, bi: number) => (
                              <div key={bi} className="mb-2">
                                <div className="flex items-center gap-4 text-xs font-semibold mb-1">
                                  <span className="text-gray-500">{b.id}</span>
                                  <span>₹{b.total}</span>
                                  <span className={b.status === 'Paid' ? 'text-[#16A34A]' : 'text-[#D97706]'}>{b.status}</span>
                                  <span className="text-gray-400">{b.paymentMode}</span>
                                </div>
                                <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">LINE ITEMS</div>
                                {b.items && b.items.length > 0 ? (
                                  <ul className="space-y-1">
                                    {b.items.map((item: any, ii: number) => (
                                      <li key={ii} className="flex justify-between text-xs text-gray-600">
                                        <span>{item.serviceName}</span>
                                        <span className="font-mono">₹{item.amount}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-xs text-gray-400">No items</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        {/* Investigations */}
                        <h5 className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1 mb-2">
                          <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-sm"></span> INVESTIGATIONS
                        </h5>
                        {p.investigations.length === 0 ? <p className="text-xs text-gray-500 mb-4">None ordered</p> : (
                          <ul className="space-y-1 mb-4">
                            {p.investigations.map((inv: any, ii: number) => (
                              <li key={ii} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 truncate w-32">{inv.testName}</span>
                                <span className="font-mono font-medium">₹{inv.amount}</span>
                                <span className={`text-[9px] px-1 py-0.5 rounded ${inv.status === 'Completed' ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#E3F2FD] text-[#1976D2]'}`}>{inv.status}</span>
                                <span className="text-gray-400 truncate w-16 text-right">{inv.result || '-'}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* OT Procedures */}
                        <h5 className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider flex items-center gap-1 mb-2">
                          <span className="w-1.5 h-1.5 bg-[#D97706] rounded-sm"></span> OT PROCEDURES
                        </h5>
                        {p.procedures.length === 0 ? <p className="text-xs text-gray-500 mb-4">None scheduled</p> : (
                          <ul className="space-y-1 mb-4">
                            {p.procedures.map((proc: any, pi: number) => (
                              <li key={pi} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700">{proc.procedure}</span>
                                <span className={`text-[9px] px-1 py-0.5 rounded ${proc.status === 'Completed' ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#E3F2FD] text-[#1976D2]'}`}>{proc.status}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Medicines */}
                        <h5 className="text-[10px] font-bold text-[#E12D45] uppercase tracking-wider flex items-center gap-1 mb-2">
                          <span className="w-1.5 h-1.5 bg-[#E12D45] rounded-sm"></span> MEDICINES DISPENSED
                        </h5>
                        {p.medicines.length === 0 ? <p className="text-xs text-gray-500">None dispensed</p> : (
                          <ul className="space-y-1">
                            {p.medicines.map((med: any, mi: number) => (
                              <li key={mi} className="flex justify-between text-xs text-gray-700">
                                <span>{med.medicineName} (x{med.quantity})</span>
                                <span className="font-mono">₹{med.amount}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Completed Investigations */}
            <div className="mb-6 rounded-xl border border-[#ECECEC] overflow-hidden">
              <div className="bg-[#800020]/5 px-4 py-2 border-b border-[#ECECEC] flex items-center gap-2">
                <span className="text-[#800020] text-[10px]">🔬</span>
                <h3 className="text-xs font-bold text-[#800020] uppercase tracking-wider">ALL COMPLETED INVESTIGATIONS ({(report?.allInvestigations || []).filter((i:any)=>i.status==='Completed').length})</h3>
              </div>
              <div className="bg-white p-4">
                <ul className="space-y-3">
                  {(report?.allInvestigations || []).filter((i:any)=>i.status==='Completed').map((inv: any, i: number) => (
                    <li key={i} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                      <span className="text-[#1A2332] font-semibold">{inv.patientName} <span className="text-gray-400 font-normal ml-2">— {inv.testName}</span></span>
                      <div className="text-right flex items-center gap-4">
                        <span className="font-mono font-bold">₹{inv.amount}</span>
                        <span className="text-xs text-gray-500">Result: {inv.result || 'Normal'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* All OT Procedures */}
            <div className="mb-10 rounded-xl border border-[#ECECEC] overflow-hidden">
              <div className="bg-[#800020]/5 px-4 py-2 border-b border-[#ECECEC] flex items-center gap-2">
                <span className="text-[#800020] text-[10px]">✂️</span>
                <h3 className="text-xs font-bold text-[#800020] uppercase tracking-wider">ALL OT PROCEDURES COMPLETED ({(report?.allProcedures || []).filter((p:any)=>p.status==='Completed').length})</h3>
              </div>
              <div className="bg-white p-4">
                <ul className="space-y-3">
                  {(report?.allProcedures || []).filter((p:any)=>p.status==='Completed').map((proc: any, i: number) => (
                    <li key={i} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                      <span className="text-[#1A2332] font-semibold">{proc.patientName} <span className="text-gray-400 font-normal ml-2">— {proc.procedure}</span></span>
                      <div className="text-right flex items-center gap-4">
                        <span className="text-xs text-gray-500">Dr. {proc.doctor}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer watermark */}
            <div className="text-center text-xs text-gray-400 bg-gray-50 rounded-lg p-3 mb-6">
              Auto-generated by VOC HMS • {new Date().toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })} • For practitioner use only
            </div>

            {/* Print/WhatsApp Actions */}
            <div className="flex justify-between items-center print:hidden bg-white p-4 border-t border-gray-100 rounded-b-2xl sticky bottom-0 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <button onClick={handleWhatsApp} className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <span className="text-lg">💬</span> Send via WhatsApp
              </button>
              <div className="flex items-center gap-3">
                <button onClick={handlePrint} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                  <Printer size={18} /> Print
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
