import { useState, useEffect } from "react";
import { addConsultation, updateConsultationStatus, updateConsultation } from "@/services/consultationService";
import { addInvestigation } from "@/services/investigationService";
import api from "@/services/api";
import { Stethoscope, Calendar, Scissors, X } from "lucide-react";
import InvestigationSelect, { InvestigationMasterData } from "../investigations/InvestigationSelect";

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
    investigations: [] as InvestigationMasterData[],
    otProcedures: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    if (selectedPatient && selectedPatient.opNumber) {
      setFormData(prev => ({
        ...prev,
        opNumber: selectedPatient.opNumber || "",
        patientName: selectedPatient.patientName || selectedPatient.fullName || "",
        doctor: selectedPatient.doctor || "",
        department: selectedPatient.department || "Orthopaedics",
        chiefComplaints: selectedPatient.complaint || "", // Auto-populate complaint
      }));
      
      // Fetch full patient record for history and demographic data
      api.get(`/patients/${encodeURIComponent(selectedPatient.opNumber)}/record`)
        .then(res => {
          setHistory(res.data);
          // If we want to populate existing consultation data (if resuming an active consultation)
          // We can parse clinicalNotes if it's JSON, or just use the fields
          if (selectedPatient.diagnosis) {
             setFormData(prev => ({ ...prev, diagnosis: selectedPatient.diagnosis }));
          }
          if (selectedPatient.prescription) {
             setFormData(prev => ({ ...prev, prescription: selectedPatient.prescription }));
          }
          if (selectedPatient.clinicalNotes) {
             try {
                const notes = JSON.parse(selectedPatient.clinicalNotes);
                setFormData(prev => ({ 
                   ...prev, 
                   chiefComplaints: notes.chiefComplaints || selectedPatient.complaint || "",
                   examination: notes.examination || "",
                   advice: notes.advice || "",
                   vitals: notes.vitals || prev.vitals
                }));
             } catch(e) {
                setFormData(prev => ({ ...prev, examination: selectedPatient.clinicalNotes }));
             }
          }
        })
        .catch(console.error);

    } else {
      setFormData({
        opNumber: "", patientName: "", doctor: "", department: "", diagnosis: "", prescription: "",
        chiefComplaints: "", examination: "", advice: "", followUpDate: "",
        vitals: { bp: "", pulse: "", temp: "", spo2: "", weight: "", height: "" },
        investigations: [],
        otProcedures: []
      });
      setHistory(null);
    }
  }, [selectedPatient]);

  const handleVitalChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, [field]: value } }));
  };

  const handleInvestigationSelect = (test: InvestigationMasterData) => {
    setFormData(prev => {
      if (prev.investigations.find(t => t.code === test.code)) return prev;
      return { ...prev, investigations: [...prev.investigations, test] };
    });
  };

  const removeInvestigation = (code: string) => {
    setFormData(prev => ({
      ...prev,
      investigations: prev.investigations.filter(t => t.code !== code)
    }));
  };

  const handleOTToggle = (proc: string) => {
    setFormData(prev => {
      const ots = prev.otProcedures.includes(proc)
        ? prev.otProcedures.filter(p => p !== proc)
        : [...prev.otProcedures, proc];
      return { ...prev, otProcedures: ots };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedPatient) return alert("Please select a patient from the queue");
    setLoading(true);
    try {
      const payload = {
        ...formData,
        clinicalNotes: JSON.stringify({
          chiefComplaints: formData.chiefComplaints,
          examination: formData.examination,
          advice: formData.advice,
          vitals: formData.vitals,
        }),
        status: "Completed"
      };

      if (selectedPatient.id) {
        await updateConsultation(selectedPatient.id, payload);
      } else {
        await addConsultation(payload);
      }
      
      // Auto-schedule investigations
      for (const testObj of formData.investigations) {
        await addInvestigation({
          opNumber: formData.opNumber,
          patientName: formData.patientName,
          testName: testObj.name,
          doctor: formData.doctor || "Consulting Doctor",
          amount: testObj.price,
          status: 'Pending'
        }).catch(console.error); // Ignore individual failures
      }

      // Auto-schedule OT procedures
      for (const procName of formData.otProcedures) {
        const procObj = otProceduresList.find(p => p.name === procName);
        if (procObj) {
          await api.post("/ot", {
            opNumber: formData.opNumber,
            patientName: formData.patientName,
            age: selectedPatient?.age?.toString() || "",
            time: "",
            procedure: procObj.name,
            doctor: formData.doctor || "Consulting Doctor",
            fee: procObj.price,
            notes: "Scheduled automatically from consultation.",
            date: new Date().toISOString().split("T")[0],
            status: 'SCHEDULED'
          }).catch(console.error);
        }
      }

      alert("Consultation Saved & Procedures Scheduled!");
      onSave();
    } catch (error) {
      console.log(error);
      alert("Error saving consultation");
    } finally {
      setLoading(false);
    }
  };



  const otProceduresList = [
    { name: "Wound Suturing", price: 800 },
    { name: "Joint Aspiration", price: 1200 },
    { name: "Casting / Splinting", price: 1500 },
    { name: "Tendon Repair", price: 5000 },
    { name: "Hardware Removal", price: 8000 },
    { name: "Carpal Tunnel Release", price: 6000 }
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
          <p className="text-[13px] text-white/80 mt-1">
            {formData.opNumber} • {history?.profile?.age || selectedPatient?.age || '--'}y/{history?.profile?.gender || selectedPatient?.gender || '--'} • {history?.profile?.bloodGroup || selectedPatient?.bloodGroup || '--'}
          </p>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider">Complaint</p>
            <p className="font-semibold text-sm">{selectedPatient.complaint || "N/A"}</p>
          </div>
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
            <select 
              value={formData.chiefComplaints || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaints: e.target.value }))}
              className="w-full h-10 px-3 border border-[#ECECEC] rounded-lg text-sm mb-2 outline-none"
            >
              <option value="">-- Select --</option>
              <option value="Neck Pain">Neck Pain</option>
              <option value="Shoulder Pain">Shoulder Pain</option>
              <option value="Elbow Pain">Elbow Pain</option>
              <option value="Wrist Pain">Wrist Pain</option>
              <option value="Finger Pain">Finger Pain</option>
              <option value="Hand Pain">Hand Pain</option>
              <option value="Lower Backache (LBA)">Lower Backache (LBA)</option>
              <option value="Hip Pain">Hip Pain</option>
              <option value="Knee Pain">Knee Pain</option>
              <option value="Ankle Pain">Ankle Pain</option>
              <option value="Foot Pain">Foot Pain</option>
              {formData.chiefComplaints && ![
                "Neck Pain", "Shoulder Pain", "Elbow Pain", "Wrist Pain", "Finger Pain", 
                "Hand Pain", "Lower Backache (LBA)", "Hip Pain", "Knee Pain", "Ankle Pain", "Foot Pain"
              ].includes(formData.chiefComplaints) && (
                <option value={formData.chiefComplaints}>{formData.chiefComplaints}</option>
              )}
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

      <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#800020] font-bold mb-4">
          <span className="text-xl">🔬</span> Order Investigations
        </h3>
        
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">Search & Add Test</label>
          <InvestigationSelect value={null} onChange={handleInvestigationSelect} className="max-w-md" />
        </div>

        {formData.investigations.length > 0 && (
          <div className="flex flex-col gap-2 max-w-md">
            {formData.investigations.map((test) => (
              <div key={test.code} className="flex items-center justify-between p-3 border border-[#ECECEC] bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-[13px] text-[#1A2332] font-medium leading-tight">
                    {test.name}
                    <div className="text-[11px] text-gray-500 mt-0.5">{test.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#800020]">₹{test.price}</span>
                  <button type="button" onClick={() => removeInvestigation(test.code)} className="text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule OT Procedures */}
      <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#800020] font-bold mb-4">
          <Scissors size={20} /> Schedule OT Procedure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otProceduresList.map((proc) => (
            <label key={proc.name} className="flex items-center justify-between p-3 border border-[#ECECEC] rounded-lg cursor-pointer hover:border-[#E12D45] transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.otProcedures.includes(proc.name)}
                  onChange={() => handleOTToggle(proc.name)}
                  className="w-4 h-4 accent-[#E12D45]"
                />
                <span className="text-[13px] text-[#1A2332] font-medium">{proc.name}</span>
              </div>
              <span className="text-[13px] font-bold text-[#800020]">₹{proc.price}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pb-8 flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="w-[200px] h-12 bg-[#E12D45] text-white font-bold rounded-lg hover:bg-[#C82239] transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Consultation"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Are you sure you want to cancel? All unsaved notes will be cleared.")) {
              setFormData({
                opNumber: "", patientName: "", doctor: "", department: "", diagnosis: "", prescription: "",
                chiefComplaints: "", examination: "", advice: "", followUpDate: "",
                vitals: { bp: "", pulse: "", temp: "", spo2: "", weight: "", height: "" },
                investigations: [], otProcedures: []
              });
            }
          }}
          className="w-[120px] h-12 bg-white border border-[#ECECEC] text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}