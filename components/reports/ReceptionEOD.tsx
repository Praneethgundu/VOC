"use client";

import { Printer, Calendar as CalendarIcon, FileText, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

export default function ReceptionEOD({ report }: { report: any }) {
  if (!report) return null;

  const dateStr = new Date(report.date).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `*VOC Vinay Ortho Care Clinic*
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
    const newWindow = window.open("", "_blank");
    import("@/lib/services/api").then(({ default: api }) => {
      api.get("/settings").then((res) => {
        let phoneStr = res.data?.whatsapp_eod_number || "";
        if (phoneStr && !phoneStr.startsWith('+')) {
          if (phoneStr.length === 10) phoneStr = '+91' + phoneStr;
        }
        const url = phoneStr 
          ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneStr)}&text=${encodeURIComponent(text)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        if (newWindow) newWindow.location.href = url;
      }).catch(e => {
        console.error(e);
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        if (newWindow) newWindow.location.href = url;
      });
    });
  };

  return (
    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl print:shadow-none print:w-full border border-[#E2E8F0] print:border-none p-8 relative">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-[#1E293B]">
          <FileText className="text-[#0F172A]" />
          <h1 className="text-xl font-bold">Reception EOD Report</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#ECFDF5] text-[#047857] px-3 py-1 rounded-full text-xs font-semibold">WhatsApp Ready</span>
        </div>
      </div>

      {/* Print Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Image src="/images/logo.jpeg" alt="VOC Logo" width={40} height={40} className="rounded-lg object-cover" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">VOC Vinay Ortho Care Clinic</h2>
        <p className="text-[#64748B] text-sm">Reception Daily Summary</p>
        <div className="mt-3 inline-block border border-[#0F172A]/20 text-[#0F172A] rounded-full px-4 py-1 text-sm font-semibold bg-[#0F172A]/5">
          {dateStr}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#DBEAFE] border border-[#DBEAFE] rounded-xl p-5">
          <p className="text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-2">Total Registrations</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{report.stats.totalRegistrations}</p>
        </div>
        <div className="bg-[#ECFDF5] border border-[#ECFDF5] rounded-xl p-5">
          <p className="text-[#059669] text-xs font-bold uppercase tracking-wider mb-2">Collections</p>
          <p className="text-3xl font-extrabold text-[#059669]">₹{(report.stats.collectionsReceived || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#FEE2E2] border border-[#FEE2E2] rounded-xl p-5">
          <p className="text-[#991B1B] text-xs font-bold uppercase tracking-wider mb-2">Pending Bills</p>
          <p className="text-3xl font-extrabold text-[#991B1B]">{report.stats.billsPending}</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Payment Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Cash</span><span className="font-bold">₹{report.paymentModeBreakdown?.cash || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">UPI</span><span className="font-bold">₹{report.paymentModeBreakdown?.upi || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Card</span><span className="font-bold">₹{report.paymentModeBreakdown?.card || 0}</span></div>
          </div>
        </div>
        <div className="border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Queue Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Completed Consultations</span><span className="font-bold text-[#059669]">{report.queueStatus?.completedRegistrations || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Pending Consultations</span><span className="font-bold text-[#92400E]">{report.queueStatus?.pendingRegistrations || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">New Patients</span><span className="font-bold">{report.stats?.newPatients || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="mb-6 rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="bg-[#0F172A]/5 px-4 py-2 border-b border-[#E2E8F0]">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">REGISTERED PATIENTS ({report.patients.length})</h3>
        </div>
        <div className="bg-white p-4 max-h-[400px] overflow-y-auto">
          <ul className="space-y-3">
            {report.patients.map((p: any, i: number) => (
              <li key={i} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                <span className="text-[#1E293B] font-semibold">{p.fullName} <span className="text-gray-400 font-normal ml-2">{p.opNumber}</span></span>
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
