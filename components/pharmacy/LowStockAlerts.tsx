"use client";

import { useEffect, useState } from "react";
import { getMedicines } from "@/services/pharmacyService";
import { AlertTriangle, TrendingDown } from "lucide-react";

export default function LowStockAlerts() {
  const [lowStockMeds, setLowStockMeds] = useState<any[]>([]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getMedicines();
      const low = data.filter((m: any) => Number(m.quantity ?? 0) < 20);
      setLowStockMeds(low);
    } catch {
      /* silence */
    }
  };

  if (lowStockMeds.length === 0) return null;

  return (
    <div className="bg-[#FFF8F1] border border-[#92400E] rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-[#92400E]" />
        <h3 className="text-[#92400E] text-[15px] font-bold">Low Stock Alerts</h3>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-[#92400E] text-white text-[11px] font-bold">
          {lowStockMeds.length} Items
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {lowStockMeds.slice(0, 3).map((med, i) => (
          <div key={i} className="flex items-center justify-between bg-white border border-[#FDE68A] p-3 rounded-lg">
            <div>
              <p className="text-[13px] font-semibold text-[#92400E]">{med.medicineName}</p>
              <p className="text-[11px] text-[#92400E] mt-0.5">{med.category}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-[#991B1B] flex items-center gap-1">
                <TrendingDown size={14} />
                {med.quantity}
              </span>
              <span className="text-[10px] text-[#92400E]">Remaining</span>
            </div>
          </div>
        ))}
      </div>
      
      {lowStockMeds.length > 3 && (
        <button className="mt-3 text-[12px] font-semibold text-[#92400E] hover:text-[#92400E]">
          View all low stock items →
        </button>
      )}
    </div>
  );
}
