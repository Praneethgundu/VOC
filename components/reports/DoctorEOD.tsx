"use client";

import { Printer, FileText } from "lucide-react";
import Image from "next/image";

export default function DoctorEOD({ report }: { report: any }) {
  if (!report) return null;

  const dateStr = new Date(report.date).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `*VOC Orthopaedic Hospital*
*Doctor EOD Report*
Dr. ${report.doctorName}
Date: ${new Date(report.date).toLocaleDateString("en-GB")}

*CONSULTATIONS*
Patients Consulted: ${report.stats.patientsConsulted}
Completed: ${report.stats.patientsCompleted}
Pending: ${report.stats.patientsPending}

*ORDERS*
Investigations Ordered: ${report.stats.investigationsOrdered}
OT Procedures Scheduled: ${report.stats.otProceduresScheduled}

*REVENUE*
Revenue Generated: ₹${report.stats.revenueGenerated}
`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl print:shadow-none print:w-full border border-[#ECECEC] print:border-none p-8 relative">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-[#1A2332]">
          <FileText className="text-[#800020]" />
          <h1 className="text-xl font-bold">Doctor EOD Report</h1>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Image src="/images/logo.jpeg" alt="VOC Logo" width={40} height={40} className="rounded-lg object-cover" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#800020]">Dr. {report.doctorName}</h2>
        <p className="text-[#6B7280] text-sm">Daily Performance Summary</p>
        <div className="mt-3 inline-block border border-[#800020]/20 text-[#800020] rounded-full px-4 py-1 text-sm font-semibold bg-[#800020]/5">
          {dateStr}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5">
          <p className="text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-2">Consulted</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{report.stats.patientsConsulted}</p>
        </div>
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
          <p className="text-[#16A34A] text-xs font-bold uppercase tracking-wider mb-2">Completed</p>
          <p className="text-3xl font-extrabold text-[#16A34A]">{report.stats.patientsCompleted}</p>
        </div>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-5">
          <p className="text-[#DC2626] text-xs font-bold uppercase tracking-wider mb-2">Pending</p>
          <p className="text-3xl font-extrabold text-[#DC2626]">{report.stats.patientsPending}</p>
        </div>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5">
          <p className="text-[#D97706] text-xs font-bold uppercase tracking-wider mb-2">Revenue</p>
          <p className="text-3xl font-extrabold text-[#D97706]">₹{(report.stats.revenueGenerated || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-[#ECECEC] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#800020] mb-4 uppercase tracking-wider">Investigations Ordered</h3>
          <div className="text-2xl font-bold">{report.stats.investigationsOrdered}</div>
          <ul className="mt-2 space-y-1 text-xs text-gray-600 max-h-[150px] overflow-y-auto">
            {report.investigations.map((inv: any, i: number) => (
              <li key={i} className="flex justify-between border-b border-gray-100 pb-1">
                <span>{inv.patientName}</span><span>{inv.testName}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-[#ECECEC] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#800020] mb-4 uppercase tracking-wider">OT Procedures</h3>
          <div className="text-2xl font-bold">{report.stats.otProceduresScheduled}</div>
          <ul className="mt-2 space-y-1 text-xs text-gray-600 max-h-[150px] overflow-y-auto">
            {report.procedures.map((p: any, i: number) => (
              <li key={i} className="flex justify-between border-b border-gray-100 pb-1">
                <span>{p.patientName}</span><span>{p.procedure}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

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
