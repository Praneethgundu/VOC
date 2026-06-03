"use client";

import { useState } from "react";
import { addMedicine } from "@/services/pharmacyService";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pill } from "lucide-react";

export default function PharmacyForm() {
  const [formData, setFormData] = useState({
    medicineId: "",
    medicineName: "",
    category: "",
    quantity: "",
    price: "",
    expiryDate: "",
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
      setFormData({ medicineId: "", medicineName: "", category: "", quantity: "", price: "", expiryDate: "" });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-[#ECECEC] p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
    >
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#ECECEC]">
        <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center">
          <Pill size={18} className="text-[#E12D45]" />
        </div>
        <div>
          <h2 className="page-title !text-[20px]">Add Medicine</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">Add new medicine to the inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Input label="Medicine ID" name="medicineId" value={formData.medicineId} onChange={handleChange} placeholder="e.g. MED001" required />
        <Input label="Medicine Name" name="medicineName" value={formData.medicineName} onChange={handleChange} placeholder="Generic name" required />
        <Select label="Category" name="category" value={formData.category} onChange={handleChange as any} required>
          <option value="">Select Category</option>
          <option>Analgesic</option>
          <option>Antibiotic</option>
          <option>Anti-inflammatory</option>
          <option>Muscle Relaxant</option>
          <option>Calcium Supplement</option>
          <option>Vitamin</option>
          <option>Antacid</option>
          <option>Other</option>
        </Select>
        <Input label="Quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" required />
        <Input label="Price per Unit (₹)" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required />
        <Input label="Expiry Date" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" loading={loading} size="lg">Save Medicine</Button>
        <Button type="button" variant="outline" size="lg"
          onClick={() => setFormData({ medicineId: "", medicineName: "", category: "", quantity: "", price: "", expiryDate: "" })}>
          Clear
        </Button>
      </div>
    </form>
  );
}