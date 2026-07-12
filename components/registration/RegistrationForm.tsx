"use client";

import { useState, useRef, useEffect } from "react";
import { generateOP } from "@/utils/generateOP";
import { addPatient, getPatients } from "@/services/patientService";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";

export default function RegistrationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [otherComplaint, setOtherComplaint] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDefaults = () => {
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5)
    };
  };

  const [formData, setFormData] = useState({
    opNumber: generateOP(),
    fullName: "",
    age: "",
    gender: "Male",
    phone: "",
    bloodGroup: "",
    address: "",
    department: "Orthopaedics",
    doctor: "",
    fee: 500,
    date: getDefaults().date,
    time: getDefaults().time,
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
    if (!formData.doctor) {
      newErrors.doctor = "Please select a consulting doctor";
    }
    if (selectedComplaints.length === 0 && !otherComplaint.trim()) {
      newErrors.complaint = "Select at least one complaint or specify 'Other'";
    }
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    const graceTime = new Date();
    graceTime.setMinutes(graceTime.getMinutes() - 10);
    if (selectedDateTime < graceTime) {
      newErrors.datetime = "Registration date and time cannot be in the past";
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
      value = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase(); // Allow only letters and spaces, and convert to uppercase
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
      const allPatients = await getPatients();
      const newMinutes = parseInt(formData.time.split(':')[0]) * 60 + parseInt(formData.time.split(':')[1]);
      const isAllocated = allPatients.some((p: any) => {
        if (p.appointmentDate === formData.date && p.doctor === formData.doctor && p.status === "Active" && p.appointmentTime) {
          const existingMinutes = parseInt(p.appointmentTime.split(':')[0]) * 60 + parseInt(p.appointmentTime.split(':')[1]);
          return Math.abs(existingMinutes - newMinutes) < 10;
        }
        return false;
      });

      if (isAllocated) {
        setErrors((prev) => ({ ...prev, datetime: "Doctor is already booked within 10 minutes of this time." }));
        setLoading(false);
        return;
      }

      const finalComplaint = [...selectedComplaints, otherComplaint.trim()].filter(Boolean).join(", ");
      const response = await addPatient({ ...formData, complaint: finalComplaint });
      if (response && response.returningPatient) {
        alert("Returning patient found! Follow-up consultation added.");
      } else {
        alert("Patient Registered Successfully");
      }
      setFormData({
        opNumber: generateOP(),
        fullName: "",
        age: "",
        gender: "Male",
        phone: "",
        bloodGroup: "",
        address: "",
        department: "Orthopaedics",
        doctor: "",
        fee: 500,
        date: getDefaults().date,
        time: getDefaults().time,
      });
      setSelectedComplaints([]);
      setOtherComplaint("");
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
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.datetime}
              min={getDefaults().date}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Time"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              min={formData.date === getDefaults().date ? getDefaults().time : undefined}
              required
            />
          </div>
        </div>
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
          maxLength={10}
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
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[12px] font-bold text-[#1E293B] mb-1.5 uppercase tracking-wider">Patient Complaint</label>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-full h-11 px-4 bg-white border ${errors.complaint ? 'border-red-300' : 'border-[#E2E8F0]'} rounded-xl text-sm outline-none transition-all flex items-center justify-between cursor-pointer`}
          >
            <span className="text-gray-700 truncate">
              {selectedComplaints.length > 0 || otherComplaint 
                ? [...selectedComplaints, otherComplaint].filter(Boolean).join(", ") 
                : "Select Complaints..."}
            </span>
            <span className="text-gray-400">▼</span>
          </div>
          {errors.complaint && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.complaint}</p>}
          
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-60 overflow-y-auto p-2">
              {[
                "Neck Pain", "Shoulder Pain", "Elbow Pain", "Wrist Pain", "Finger Pain", 
                "Hand Pain", "Lower Backache (LBA)", "Hip Pain", "Knee Pain", "Ankle Pain", "Foot Pain"
              ].map(comp => (
                <label key={comp} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedComplaints.includes(comp)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedComplaints([...selectedComplaints, comp]);
                      else setSelectedComplaints(selectedComplaints.filter(c => c !== comp));
                    }}
                    className="rounded text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#1E293B]">{comp}</span>
                </label>
              ))}
              <div className="p-2 border-t mt-1">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input 
                    type="checkbox" 
                    checked={selectedComplaints.includes("Other")}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedComplaints([...selectedComplaints, "Other"]);
                      else {
                        setSelectedComplaints(selectedComplaints.filter(c => c !== "Other"));
                        setOtherComplaint("");
                      }
                    }}
                    className="rounded text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="text-sm font-bold text-[#1E293B]">Other</span>
                </label>
                {selectedComplaints.includes("Other") && (
                  <input 
                    type="text"
                    placeholder="Specify other complaint..."
                    value={otherComplaint}
                    onChange={(e) => setOtherComplaint(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Consulting Doctor
          </label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            className={`w-full h-10 px-3 rounded-lg border ${errors.doctor ? 'border-red-500' : 'border-[#E2E8F0]'} outline-none focus:border-[#2563EB] text-[13px] bg-white transition-colors`}
          >
            <option value="">Select Doctor...</option>
            <option value="Dr. H. Vinay Kumar">Dr. H. Vinay Kumar</option>
          </select>
          {errors.doctor && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.doctor}</p>}
        </div>
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
              fee: 500,
              date: getDefaults().date,
              time: getDefaults().time,
            });
            setSelectedComplaints([]);
            setOtherComplaint("");
            setErrors({});
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}