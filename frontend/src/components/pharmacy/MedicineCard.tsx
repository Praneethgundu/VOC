import React from 'react';
import { Pill } from 'lucide-react';

interface MedicineCardProps {
  medicine: any;
  onRestock: (med: any) => void;
}

export default function MedicineCard({ medicine, onRestock }: MedicineCardProps) {
  const qty = Number(medicine.quantity) || 0;
  const isLowStock = qty < 50;
  
  return (
    <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-[#FFF4F4] text-[#E12D45] p-2 rounded-lg shrink-0">
          <Pill size={20} className="fill-current opacity-20" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#1A2332] leading-tight mb-0.5">{medicine.medicineName}</h3>
          <p className="text-xs text-[#6B7280]">{medicine.category}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <p className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-1">Stock</p>
          <p className={`text-sm font-bold ${isLowStock ? 'text-[#E12D45]' : 'text-[#1A2332]'}`}>{qty} <span className="text-[10px] font-normal text-[#6B7280]">Units</span></p>
        </div>
        <div>
          <p className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-1">Price</p>
          <p className="text-sm font-bold text-[#E12D45]">₹{medicine.price}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-1">Expiry</p>
          <p className="text-sm font-bold text-[#1A2332]">{medicine.expiryDate}</p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1 mb-4">
        <div className={`h-1 rounded-full ${isLowStock ? 'bg-[#E12D45]' : 'bg-[#16A34A]'}`} style={{ width: `${Math.min(100, (qty / 500) * 100)}%` }}></div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-[#ECECEC] mt-auto">
        <span className="text-[10px] font-semibold text-[#6B7280] px-2 py-1 bg-gray-50 rounded">
          {medicine.medicineId}
        </span>
        <button 
          onClick={() => onRestock(medicine)}
          className="text-xs font-bold text-[#E12D45] border border-[#E12D45]/20 hover:bg-[#FFF4F4] px-3 py-1.5 rounded transition-colors flex items-center gap-1"
        >
          📦 Restock
        </button>
      </div>
    </div>
  );
}
