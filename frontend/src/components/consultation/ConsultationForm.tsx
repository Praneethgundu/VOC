import { useState, useEffect } from "react";
import { addConsultation, updateConsultationStatus } from "@/services/consultationService";
import { Stethoscope, Calendar } from "lucide-react";

export default function ConsultationForm({ selectedPatient, onSave }: { selectedPatient: any, onSave: () => void }) {
  const [formData, setFormData] = useState({
    opNumber: "",
    patientName: "",
    doctor: "",
    department: "",
    diagnosis: "",
    prescription: "",
    chiefComplaints: "",
    examination: "",
    advice: "",
    followUpDate: "",
    vitals: {
      bp: "",
      pulse: "",
      temp: "",
      spo2: "",
      weight: "",
      height: "",
    },
    investigations: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        opNumber: selectedPatient.opNumber || "",
        patientName: selectedPatient.patientName || selectedPatient.fullName || "",
        doctor: selectedPatient.doctor || "",
        department: selectedPatient.department || "Orthopaedics",
      }));
    } else {
      setFormData({
        opNumber: "", patientName: "", doctor: "", department: "", diagnosis: "", prescription: "",
        chiefComplaints: "", examination: "", advice: "", followUpDate: "",
        vitals: { bp: "", pulse: "", temp: "", spo2: "", weight: "", height: "" },
        investigations: []
      });
    }
  }, [selectedPatient]);

  const handleVitalChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, [field]: value } }));
  };

  const handleInvestigationToggle = (test: string) => {
    setFormData(prev => {
      const invs = prev.investigations.includes(test)
        ? prev.investigations.filter(t => t !== test)
        : [...prev.investigations, test];
      return { ...prev, investigations: invs };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedPatient) return alert("Please select a patient from the queue");
    setLoading(true);
    try {
      await addConsultation({ ...formData, status: "Completed" });
      if (selectedPatient.id) {
        await updateConsultationStatus(selectedPatient.id, "Completed");
      }
      alert("Consultation Saved");
      onSave();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const investigationsList = [
    { name: "X-Ray Knee AP/Lat", price: 400 },
    { name: "X-Ray Cervical Spine", price: 450 },
    { name: "X-Ray Lumbar Spine", price: 450 },
    { name: "X-Ray Pelvis", price: 400 },
    { name: "MRI Knee Joint", price: 3500 },
    { name: "MRI Cervical Spine", price: 4000 },
    { name: "MRI Lumbar Spine", price: 4000 },
    { name: "MRI Shoulder", price: 3500 },
    { name: "CT Scan Joints", price: 2500 },
    { name: "DEXA Bone Density Scan", price: 1500 },
    { name: "Rheumatoid Factor (RF)", price: 600 },
    { name: "Serum Uric Acid", price: 200 },
    { name: "Serum Calcium", price: 250 },
    { name: "Vitamin D3 (25-OH)", price: 1200 },
    { name: "CRP (C-Reactive Protein)", price: 400 },
    { name: "ESR", price: 150 },
  ];

  if (!selectedPatient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-[#ECECEC] text-[#6B7280]">
        <p>Please select a patient from the queue to begin consultation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 h-full overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-[#800020] rounded-xl text-white p-5 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-bold">{formData.patientName}</h2>
          <p className="text-[13px] text-white/80 mt-1">{formData.opNumber} • 45y/Male • B+</p>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider">Doctor</p>
            <p className="font-semibold text-sm">{formData.doctor || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider">Dept</p>
            <p className="font-semibold text-sm">{formData.department}</p>
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#800020] font-bold mb-4">
          <Stethoscope size={16} /> Vitals
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "BP", field: "bp", placeholder: "120/80" },
            { label: "PULSE", field: "pulse", placeholder: "72 bpm" },
            { label: "TEMP", field: "temp", placeholder: "98.6°F" },
            { label: "SPO2", field: "spo2", placeholder: "99%" },
            { label: "WEIGHT", field: "weight", placeholder: "70 kg" },
            { label: "HEIGHT", field: "height", placeholder: "170 cm" },
          ].map((v) => (
            <div key={v.field}>
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">{v.label}</label>
              <input
                type="text"
                value={(formData.vitals as any)[v.field]}
                onChange={(e) => handleVitalChange(v.field, e.target.value)}
                placeholder={v.placeholder}
                className="w-full h-10 px-3 border border-[#ECECEC] rounded-lg text-sm outline-none focus:border-[#E12D45] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#800020] font-bold mb-4">
          <span className="text-xl">📋</span> Clinical Notes
        </h3>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">Chief Complaints</label>
            <select className="w-full h-10 px-3 border border-[#ECECEC] rounded-lg text-sm mb-2 outline-none">
              <option>-- Select --</option>
              <option>Knee Pain</option>
              <option>Back Pain</option>
            </select>
            <textarea
              value={formData.chiefComplaints}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaints: e.target.value }))}
              placeholder="Patient's complaints..."
              className="w-full h-24 p-3 border border-[#ECECEC] rounded-lg text-sm outline-none focus:border-[#E12D45] resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">Examination</label>
            <textarea
              value={formData.examination}
              onChange={(e) => setFormData(prev => ({ ...prev, examination: e.target.value }))}
              placeholder="Clinical examination findings..."
              className="w-full h-full p-3 border border-[#ECECEC] rounded-lg text-sm outline-none focus:border-[#E12D45] resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">Diagnosis</label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Clinical diagnosis..."
              className="w-full h-24 p-3 border border-[#ECECEC] rounded-lg text-sm outline-none focus:border-[#E12D45] resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">Prescription</label>
            <select className="w-full h-10 px-3 border border-[#ECECEC] rounded-lg text-sm mb-2 outline-none">
              <option>-- Select Standard Prescription --</option>
            </select>
            <textarea
              value={formData.prescription}
              onChange={(e) => setFormData(prev => ({ ...prev, prescription: e.target.value }))}
              placeholder="Medicines & dosages..."
              className="w-full h-24 p-3 border border-[#ECECEC] rounded-lg text-sm outline-none focus:border-[#E12D45] resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">Advice & Instructions</label>
          <textarea
            value={formData.advice}
            onChange={(e) => setFormData(prev => ({ ...prev, advice: e.target.value }))}
            placeholder="Patient advice..."
            className="w-full h-20 p-3 border border-[#ECECEC] rounded-lg text-sm outline-none focus:border-[#E12D45] resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
        <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">FOLLOW-UP DATE (OPTIONAL)</label>
        <div className="relative max-w-xs">
          <input
            type="date"
            value={formData.followUpDate}
            onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
            className="w-full h-10 px-3 border border-[#ECECEC] rounded-lg text-sm outline-none focus:border-[#E12D45]"
          />
        </div>
      </div>

      {/* Order Investigations */}
      <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#800020] font-bold mb-4">
          <span className="text-xl">🔬</span> Order Investigations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investigationsList.map((test) => (
            <label key={test.name} className="flex items-center justify-between p-3 border border-[#ECECEC] rounded-lg cursor-pointer hover:border-[#E12D45] transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.investigations.includes(test.name)}
                  onChange={() => handleInvestigationToggle(test.name)}
                  className="w-4 h-4 accent-[#E12D45]"
                />
                <span className="text-[13px] text-[#1A2332] font-medium">{test.name}</span>
              </div>
              <span className="text-[13px] font-bold text-[#800020]">₹{test.price}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pb-8">
        <button
          type="submit"
          disabled={loading}
          className="w-[200px] h-12 bg-[#E12D45] text-white font-bold rounded-lg hover:bg-[#C82239] transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Consultation"}
        </button>
      </div>
    </form>
  );
}