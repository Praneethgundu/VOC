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
    complaint: "",
    fee: 500,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.length < 3) {
      newErrors.fullName = "Patient name must be at least 3 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = "Patient name cannot contain special characters or numbers";
    }

    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 150) {
      newErrors.age = "Enter a valid age between 1 and 150";
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = "Blood group is required";
    }
    if (!formData.complaint) {
      newErrors.complaint = "Patient complaint is required";
    }
    if (formData.fee === undefined || formData.fee === null || Number(formData.fee) < 0) {
      newErrors.fee = "Enter a valid consultation fee";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value = e.target.value;

    if (e.target.name === "fullName") {
      value = value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
    }

    if (e.target.name === "age" && value !== "") {
      const numVal = Number(value);
      if (numVal > 150) return; // Block typing more than 150
      if (numVal < 0) return; // Block typing negative numbers
    }

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
        complaint: "",
        fee: 500,
      });
      onSuccess?.();
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to save patient record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-[#E2E8F0] p-6"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E2E8F0]">
        <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center">
          <UserPlus size={18} className="text-[#2563EB]" />
        </div>
        <div>
          <h2 className="page-title !text-[20px]">New Patient Registration</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
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
          error={errors.fullName}
          required
        />
        <Input
          label="Age"
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age in years"
          error={errors.age}
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
          error={errors.phone}
          required
        />
        <Select
          label="Blood Group"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          error={errors.bloodGroup}
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
        <Select
          label="Patient Complaint"
          name="complaint"
          value={formData.complaint}
          onChange={handleChange}
          error={errors.complaint}
          required
        >
          <option value="">Select Complaint</option>
          <option>Neck Pain</option>
          <option>Shoulder Pain</option>
          <option>Elbow Pain</option>
          <option>Wrist Pain</option>
          <option>Finger Pain</option>
          <option>Hand Pain</option>
          <option>Lower Backache (LBA)</option>
          <option>Hip Pain</option>
          <option>Knee Pain</option>
          <option>Ankle Pain</option>
          <option>Foot Pain</option>
        </Select>
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
          error={errors.fee}
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
          onClick={() => {
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
              complaint: "",
              fee: 500,
            });
            setErrors({});
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}