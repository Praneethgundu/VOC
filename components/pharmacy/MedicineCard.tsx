import React from 'react';
import { Pill, Trash2 } from 'lucide-react';

interface MedicineCardProps {
  medicine: any;
  onRestock: (med: any) => void;
  onDelete: (id: string) => void;
  onClick: (med: any) => void;
}

export default function MedicineCard({ medicine, onRestock, onDelete, onClick }: MedicineCardProps) {
  const qty = Number(medicine.stock) || 0;
  const isLowStock = qty < 50;
  
  return (
    <div 
      className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer"
      onClick={() => onClick(medicine)}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-[#FEE2E2] text-[#2563EB] p-2 rounded-lg shrink-0">
          <Pill size={20} className="fill-current opacity-20" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#1E293B] leading-tight mb-0.5">{medicine.medicineName}</h3>
          <p className="text-xs text-[#64748B]">{medicine.category}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(medicine.medicineId); }}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Medicine"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">Stock</p>
          <p className={`text-sm font-bold ${isLowStock ? 'text-[#2563EB]' : 'text-[#1E293B]'}`}>{qty} <span className="text-[10px] font-normal text-[#64748B]">Units</span></p>
        </div>
        <div>
          <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">Price</p>
          <p className="text-sm font-bold text-[#2563EB]">₹{medicine.price}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">Expiry</p>
          <p className="text-sm font-bold text-[#1E293B]">{medicine.expiryDate}</p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1 mb-4">
        <div className={`h-1 rounded-full ${isLowStock ? 'bg-[#2563EB]' : 'bg-[#059669]'}`} style={{ width: `${Math.min(100, (qty / 500) * 100)}%` }}></div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0] mt-auto">
        <span className="text-[10px] font-semibold text-[#64748B] px-2 py-1 bg-gray-50 rounded">
          {medicine.medicineId}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onRestock(medicine); }}
          className="text-xs font-bold text-[#2563EB] border border-[#2563EB]/20 hover:bg-[#FEE2E2] px-3 py-1.5 rounded transition-colors flex items-center gap-1"
        >
          📦 Restock
        </button>
      </div>
    </div>
  );
}
