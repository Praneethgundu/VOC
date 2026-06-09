import React, { useState } from 'react';
import { PackagePlus, X } from 'lucide-react';
import { Input } from "@/components/ui/Input";
import { restockMedicine } from '@/services/pharmacyService';

interface RestockModalProps {
  medicine: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RestockModal({ medicine, onClose, onSuccess }: RestockModalProps) {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0) return;
    setLoading(true);
    try {
      await restockMedicine(medicine.medicineId, Number(quantity));
      alert("Medicine Restocked Successfully");
      onSuccess();
      onClose();
    } catch (e) {
      alert("Failed to restock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
        <div className="bg-[#1A2332] p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PackagePlus size={24} className="text-[#16A34A]" />
            <h2 className="text-lg font-bold">Restock Medicine</h2>
          </div>
          <button type="button" onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-sm font-bold text-[#1A2332]">{medicine.medicineName}</p>
            <p className="text-xs text-gray-500">Current Stock: {medicine.quantity}</p>
          </div>
          <Input 
            label="Quantity to Add" 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            placeholder="e.g. 100" 
            min="1"
            required 
          />
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2">
            {loading ? "Saving..." : "Confirm Restock"}
          </button>
        </div>
      </form>
    </div>
  );
}
