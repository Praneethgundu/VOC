"use client";

import { Printer, Calendar as CalendarIcon, FileText, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

export default function ReceptionEOD({ report }: { report: any }) {
  if (!report) return null;

  const dateStr = new Date(report.date).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `*VOC Orthopaedic Hospital*
*Reception EOD Report*
Date: ${new Date(report.date).toLocaleDateString("en-GB")}

*REGISTRATIONS*
Total Registrations: ${report.stats.totalRegistrations}
New Patients: ${report.stats.newPatients}
Returning Patients: ${report.stats.returningPatients}

*BILLING*
Bills Generated: ${report.stats.billsGenerated}
Bills Paid: ${report.stats.billsPaid}
Bills Pending: ${report.stats.billsPending}

*COLLECTIONS*
Total Collections: ₹${report.stats?.collectionsReceived}
- Cash: ₹${report.paymentModeBreakdown?.cash || 0}
- UPI: ₹${report.paymentModeBreakdown?.upi || 0}
- Card: ₹${report.paymentModeBreakdown?.card || 0}
Pending Amount: ₹${report.stats?.pendingAmount}
`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl print:shadow-none print:w-full border border-[#ECECEC] print:border-none p-8 relative">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-[#1A2332]">
          <FileText className="text-[#800020]" />
          <h1 className="text-xl font-bold">Reception EOD Report</h1>
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
        <p className="text-[#6B7280] text-sm">Reception Daily Summary</p>
        <div className="mt-3 inline-block border border-[#800020]/20 text-[#800020] rounded-full px-4 py-1 text-sm font-semibold bg-[#800020]/5">
          {dateStr}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5">
          <p className="text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-2">Total Registrations</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{report.stats.totalRegistrations}</p>
        </div>
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
          <p className="text-[#16A34A] text-xs font-bold uppercase tracking-wider mb-2">Collections</p>
          <p className="text-3xl font-extrabold text-[#16A34A]">₹{(report.stats.collectionsReceived || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-5">
          <p className="text-[#DC2626] text-xs font-bold uppercase tracking-wider mb-2">Pending Bills</p>
          <p className="text-3xl font-extrabold text-[#DC2626]">{report.stats.billsPending}</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-[#ECECEC] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#800020] mb-4 uppercase tracking-wider">Payment Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Cash</span><span className="font-bold">₹{report.paymentModeBreakdown?.cash || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">UPI</span><span className="font-bold">₹{report.paymentModeBreakdown?.upi || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Card</span><span className="font-bold">₹{report.paymentModeBreakdown?.card || 0}</span></div>
          </div>
        </div>
        <div className="border border-[#ECECEC] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#800020] mb-4 uppercase tracking-wider">Queue Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Completed Consultations</span><span className="font-bold text-[#16A34A]">{report.queueStatus?.completedRegistrations || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Pending Consultations</span><span className="font-bold text-[#D97706]">{report.queueStatus?.pendingRegistrations || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">New Patients</span><span className="font-bold">{report.stats?.newPatients || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="mb-6 rounded-xl border border-[#ECECEC] overflow-hidden">
        <div className="bg-[#800020]/5 px-4 py-2 border-b border-[#ECECEC]">
          <h3 className="text-xs font-bold text-[#800020] uppercase tracking-wider">REGISTERED PATIENTS ({report.patients.length})</h3>
        </div>
        <div className="bg-white p-4 max-h-[400px] overflow-y-auto">
          <ul className="space-y-3">
            {report.patients.map((p: any, i: number) => (
              <li key={i} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                <span className="text-[#1A2332] font-semibold">{p.fullName} <span className="text-gray-400 font-normal ml-2">{p.opNumber}</span></span>
                <span className="text-xs text-gray-500">{p.doctor || "Unassigned"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center print:hidden bg-white p-4 border-t border-gray-100 rounded-b-2xl sticky bottom-0 z-10">
        <button onClick={handleWhatsApp} className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2">
          <span>💬</span> Send via WhatsApp
        </button>
        <button onClick={handlePrint} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2">
          <Printer size={18} /> Print
        </button>
      </div>
    </div>
  );
}
