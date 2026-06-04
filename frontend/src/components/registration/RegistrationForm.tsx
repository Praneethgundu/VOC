"use client";

import { useState } from "react";
import { generateOP } from "@/utils/generateOP";
import { addPatient } from "@/services/patientService";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";

export default function RegistrationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    opNumber: generateOP(),
    fullName: "",
    age: "",
    gender: "Male",
    phone: "",
    bloodGroup: "",
    address: "",
    department: "",
    doctor: "",
    fee: 500,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPatient(formData);
      alert("Patient Registered Successfully");
      setFormData({
        opNumber: generateOP(),
        fullName: "",
        age: "",
        gender: "Male",
        phone: "",
        bloodGroup: "",
        address: "",
        department: "",
        doctor: "",
        fee: 500,
      });
      onSuccess?.();
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
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#ECECEC]">
        <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center">
          <UserPlus size={18} className="text-[#E12D45]" />
        </div>
        <div>
          <h2 className="page-title !text-[20px]">New Patient Registration</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            Fill in patient details to register
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="OP Number"
          value={formData.opNumber}
          readOnly
          hint="Auto-generated"
        />
        <Input
          label="Patient Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
          required
        />
        <Input
          label="Age"
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age in years"
          required
        />
        <Select
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </Select>
        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 XXXXX XXXXX"
          required
        />
        <Select
          label="Blood Group"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
        >
          <option value="">Select Blood Group</option>
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>AB+</option>
          <option>AB-</option>
          <option>O+</option>
          <option>O-</option>
        </Select>
        <Input
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g. Orthopaedics"
        />
        <Input
          label="Consulting Doctor"
          name="doctor"
          value={formData.doctor}
          onChange={handleChange}
          placeholder="e.g. Dr. Reddy"
        />
        <div className="md:col-span-2">
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full address"
          />
        </div>
        <Input
          label="Consultation Fee (₹)"
          type="number"
          name="fee"
          value={formData.fee}
          onChange={handleChange}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" loading={loading} size="lg">
          Register Patient
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() =>
            setFormData({
              opNumber: generateOP(),
              fullName: "",
              age: "",
              gender: "Male",
              phone: "",
              bloodGroup: "",
              address: "",
              department: "",
              doctor: "",
              fee: 500,
            })
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}