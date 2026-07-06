"use client";

import { Printer, FileText } from "lucide-react";
import Image from "next/image";

export default function PharmacyEOD({ report }: { report: any }) {
  if (!report) return null;

  const dateStr = new Date(report.date).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `*VOC Orthopaedic Hospital*
*Pharmacy EOD Report*
Date: ${new Date(report.date).toLocaleDateString("en-GB")}

*PERFORMANCE*
Medicines Dispensed: ${report.stats.medicinesDispensed}
Revenue Generated: ₹${report.stats.revenueGenerated}
Bills Processed: ${report.stats.totalPrescriptionsProcessed}

*INVENTORY ALERTS*
Low Stock Items: ${report.stats.lowStockMedicines}
Out of Stock Items: ${report.stats.outOfStockMedicines}
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
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-[#1E293B]">
          <FileText className="text-[#0F172A]" />
          <h1 className="text-xl font-bold">Pharmacy EOD Report</h1>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Image src="/images/logo.jpeg" alt="VOC Logo" width={40} height={40} className="rounded-lg object-cover" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Pharmacy Department</h2>
        <p className="text-[#64748B] text-sm">Daily Operations Summary</p>
        <div className="mt-3 inline-block border border-[#0F172A]/20 text-[#0F172A] rounded-full px-4 py-1 text-sm font-semibold bg-[#0F172A]/5">
          {dateStr}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#DBEAFE] border border-[#DBEAFE] rounded-xl p-5">
          <p className="text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-2">Dispensed</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{report.stats.medicinesDispensed}</p>
        </div>
        <div className="bg-[#ECFDF5] border border-[#ECFDF5] rounded-xl p-5">
          <p className="text-[#059669] text-xs font-bold uppercase tracking-wider mb-2">Revenue</p>
          <p className="text-3xl font-extrabold text-[#059669]">₹{(report.stats.revenueGenerated || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5">
          <p className="text-[#92400E] text-xs font-bold uppercase tracking-wider mb-2">Low Stock</p>
          <p className="text-3xl font-extrabold text-[#92400E]">{report.stats.lowStockMedicines}</p>
        </div>
        <div className="bg-[#FEE2E2] border border-[#FEE2E2] rounded-xl p-5">
          <p className="text-[#991B1B] text-xs font-bold uppercase tracking-wider mb-2">Out of Stock</p>
          <p className="text-3xl font-extrabold text-[#991B1B]">{report.stats.outOfStockMedicines}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Medicine Usage Summary</h3>
          </div>
          <div className="p-4 max-h-[250px] overflow-y-auto">
            <ul className="space-y-2 text-sm">
              {Object.keys(report.usageSummary).map((medId, i) => (
                <li key={i} className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span>{medId}</span>
                  <div className="text-right">
                    <span className="font-bold mr-3">x{report.usageSummary[medId].count}</span>
                    <span className="text-gray-500">₹{report.usageSummary[medId].amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="bg-red-50 px-4 py-2 border-b border-red-100">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">Inventory Alerts</h3>
          </div>
          <div className="p-4 max-h-[250px] overflow-y-auto">
            <ul className="space-y-2 text-sm">
              {report.inventoryAlerts.map((inv: any, i: number) => (
                <li key={i} className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span>{inv.medicineName}</span>
                  <span className={`font-bold ${inv.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>{inv.stock} left</span>
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
