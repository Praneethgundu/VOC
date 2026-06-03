"use client";

import { useState } from "react";
import { addInvestigation } from "@/services/investigationService";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Microscope } from "lucide-react";

export default function InvestigationForm() {
  const [formData, setFormData] = useState({
    opNumber: "",
    patientName: "",
    testName: "",
    doctor: "",
    amount: "",
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addInvestigation(formData);
      alert("Investigation Ordered");
      setFormData({ opNumber: "", patientName: "", testName: "", doctor: "", amount: "", status: "Pending" });
    } catch (err) {
      console.log(err);
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#ECECEC]">
        <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center">
          <Microscope size={18} className="text-[#E12D45]" />
        </div>
        <div>
          <h2 className="page-title !text-[20px]">Investigation Order</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">Order lab tests and radiology investigations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="OP Number" name="opNumber" value={formData.opNumber} onChange={handleChange} placeholder="e.g. OP/2025/001" required />
        <Input label="Patient Name" name="patientName" value={formData.patientName} onChange={handleChange} placeholder="Full name" required />
        <Select label="Investigation Type" name="testName" value={formData.testName} onChange={handleChange} required>
          <option value="">Select Test</option>
          <option>X-Ray</option>
          <option>MRI</option>
          <option>CT Scan</option>
          <option>Blood Test</option>
          <option>Urine Analysis</option>
          <option>ECG</option>
          <option>Ultrasound</option>
          <option>Bone Density Scan</option>
        </Select>
        <Input label="Consulting Doctor" name="doctor" value={formData.doctor} onChange={handleChange} placeholder="e.g. Dr. Reddy" required />
        <Input label="Amount (₹)" type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" />
        <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </Select>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" loading={loading} size="lg">Order Investigation</Button>
        <Button type="button" variant="outline" size="lg"
          onClick={() => setFormData({ opNumber: "", patientName: "", testName: "", doctor: "", amount: "", status: "Pending" })}>
          Clear
        </Button>
      </div>
    </form>
  );
}