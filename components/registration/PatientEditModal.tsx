import { useState } from "react";
import { updatePatient } from "@/services/patientService";

export default function PatientEditModal({ patient, onClose, onSuccess }: { patient: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState(patient);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name;
    let value = e.target.value;

    if (name === "fullName") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }

    if (name === "age" && value !== "") {
      const numVal = Number(value);
      if (numVal > 150 || numVal < 0) return;
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.fullName.length < 3 || !/^[a-zA-Z\s]+$/.test(formData.fullName)) {
       setError("Patient name must be at least 3 characters and contain no numbers or special characters.");
       return;
    }
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
       setError("Enter a valid age between 1 and 150.");
       return;
    }
    setLoading(true);
    setError("");
    try {
      await updatePatient(patient.opNumber, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-[500px] p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#0F172A] mb-4">Edit Patient - {patient.opNumber}</h2>
        {error && <div className="mb-4 text-red-500 text-sm font-semibold">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700">Full Name</label>
            <input name="fullName" value={formData.fullName || ""} onChange={handleChange} className="border p-2 rounded outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Age</label>
              <input type="number" name="age" value={formData.age || ""} onChange={handleChange} className="border p-2 rounded outline-none" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Gender</label>
              <select name="gender" value={formData.gender || ""} onChange={handleChange} className="border p-2 rounded outline-none" required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Phone</label>
              <input name="phone" value={formData.phone || ""} onChange={handleChange} className="border p-2 rounded outline-none" maxLength={10} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} className="border p-2 rounded outline-none">
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Appointment Date</label>
              <input type="date" name="date" value={formData.appointmentDate || formData.date || ""} onChange={handleChange} className="border p-2 rounded outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Appointment Time</label>
              <input type="time" name="time" value={formData.appointmentTime || formData.time || ""} onChange={handleChange} className="border p-2 rounded outline-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700">Address</label>
            <input name="address" value={formData.address || ""} onChange={handleChange} className="border p-2 rounded outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Department</label>
              <input name="department" value={formData.department || ""} onChange={handleChange} className="border p-2 rounded outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Doctor</label>
              <input name="doctor" value={formData.doctor || ""} onChange={handleChange} className="border p-2 rounded outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Patient Complaint</label>
              <select name="complaint" value={formData.complaint || ""} onChange={handleChange} className="border p-2 rounded outline-none" required>
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
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded font-semibold text-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#0F172A] text-white rounded font-semibold disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
