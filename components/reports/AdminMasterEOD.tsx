"use client";

import { Printer, FileText } from "lucide-react";
import Image from "next/image";

export default function AdminMasterEOD({ report }: { report: any }) {
  if (!report) return null;

  const dateStr = new Date(report.date).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `*VOC Orthopaedic Hospital*
*Admin Master EOD Report*
Date: ${new Date(report.date).toLocaleDateString("en-GB")}

*EXECUTIVE SUMMARY*
Total Registrations: ${report.stats.totalRegistrations}
Total Consultations: ${report.stats.totalConsultations}
Total Investigations: ${report.stats.totalInvestigations}
Total Procedures: ${report.stats.totalProcedures}
Medicines Dispensed: ${report.stats.totalMedicinesDispensed}

*FINANCIALS*
Total Revenue: ₹${report.stats.totalRevenue}
Pending Revenue: ₹${report.stats.pendingRevenue}
Pending Bills: ${report.stats.pendingBills}
`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl print:shadow-none print:w-full border border-[#E2E8F0] print:border-none p-8 relative">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-[#1E293B]">
          <FileText className="text-[#0F172A]" />
          <h1 className="text-xl font-bold">Admin Master EOD Report</h1>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Image src="/images/logo.jpeg" alt="VOC Logo" width={40} height={40} className="rounded-lg object-cover" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">VOC Orthopaedic Hospital</h2>
        <p className="text-[#64748B] text-sm">Master Hospital Summary</p>
        <div className="mt-3 inline-block border border-[#0F172A]/20 text-[#0F172A] rounded-full px-4 py-1 text-sm font-semibold bg-[#0F172A]/5">
          {dateStr}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#ECFDF5] border border-[#ECFDF5] rounded-xl p-5">
          <p className="text-[#059669] text-xs font-bold uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-3xl font-extrabold text-[#059669]">₹{(report.stats.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#FEE2E2] border border-[#FEE2E2] rounded-xl p-5">
          <p className="text-[#991B1B] text-xs font-bold uppercase tracking-wider mb-2">Pending Amount</p>
          <p className="text-3xl font-extrabold text-[#991B1B]">₹{(report.stats.pendingRevenue || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Registrations</p>
          <p className="text-xl font-bold text-gray-800">{report.stats.totalRegistrations}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Consultations</p>
          <p className="text-xl font-bold text-gray-800">{report.stats.totalConsultations}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Investigations</p>
          <p className="text-xl font-bold text-gray-800">{report.stats.totalInvestigations}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">OT Procedures</p>
          <p className="text-xl font-bold text-gray-800">{report.stats.totalProcedures}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Meds Dispensed</p>
          <p className="text-xl font-bold text-gray-800">{report.stats.totalMedicinesDispensed}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Department Revenue</h3>
          </div>
          <div className="p-4 max-h-[250px] overflow-y-auto">
            <ul className="space-y-2 text-sm">
              {report.departmentRevenue.map((d: any, i: number) => (
                <li key={i} className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span>{d.department}</span>
                  <span className="font-bold text-[#059669]">₹{d.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Doctor Revenue</h3>
          </div>
          <div className="p-4 max-h-[250px] overflow-y-auto">
            <ul className="space-y-2 text-sm">
              {report.doctorRevenue.map((d: any, i: number) => (
                <li key={i} className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span>Dr. {d.doctor}</span>
                  <span className="font-bold text-[#059669]">₹{d.amount}</span>
                </li>
              ))}
            </ul>
          </div>
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
