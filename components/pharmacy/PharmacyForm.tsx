"use client";

import { useState } from "react";
import { addMedicine } from "@/services/pharmacyService";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pill, X } from "lucide-react";

export default function PharmacyForm({ onClose, onAdd }: { onClose: () => void, onAdd: () => void }) {
  const [formData, setFormData] = useState({
    medicineName: "",
    category: "",
    quantity: "",
    price: "",
    expiryDate: "",
    batch: "",
    distributor: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addMedicine(formData);
      alert("Medicine Added Successfully");
      onAdd();
      onClose();
    } catch (error) {
      console.log(error);
      alert("Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden"
      >
        <div className="bg-[#800020] p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Pill size={24} />
            <h2 className="text-lg font-bold">Add New Medicine</h2>
          </div>
          <button type="button" onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input label="Medicine Name" name="medicineName" value={formData.medicineName} onChange={handleChange} placeholder="e.g. Paracetamol 500mg" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" name="category" value={formData.category} onChange={handleChange as any} required>
              <option value="">Select Category</option>
              <option>Analgesic</option>
              <option>Antibiotic</option>
              <option>Anti-inflammatory</option>
              <option>Muscle Relaxant</option>
              <option>Supplement</option>
              <option>NSAID</option>
              <option>Other</option>
            </Select>
            <Input label="Expiry Date" type="month" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Initial Quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" required />
            <Input label="Price per Unit (₹)" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Batch Number" name="batch" value={formData.batch} onChange={handleChange} placeholder="e.g. BT-2024" />
            <Input label="Distributor Name" name="distributor" value={formData.distributor} onChange={handleChange} placeholder="e.g. Apex Pharma" />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#E12D45] text-white font-bold rounded-xl hover:bg-[#800020] transition-colors flex items-center gap-2">
            {loading ? "Saving..." : "Add Medicine"}
          </button>
        </div>
      </form>
    </div>
  );
}