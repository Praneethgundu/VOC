import { useState, useEffect } from "react";
import { addConsultation, updateConsultationStatus, updateConsultation } from "@/services/consultationService";
import { addInvestigation } from "@/services/investigationService";
import { getMedicines } from "@/services/pharmacyService";
import api from "@/services/api";
import { Stethoscope, Calendar, Scissors, X, Plus } from "lucide-react";
import InvestigationSelect, { InvestigationMasterData } from "../investigations/InvestigationSelect";

export interface PrescriptionData {
  medicineName: string;
  dose: string;
  frequency: string;
  timing: string;
  days: string;
}

export default function ConsultationForm({ selectedPatient, onSave }: { selectedPatient: any, onSave: () => void }) {
  const [formData, setFormData] = useState({
    opNumber: "",
    patientName: "",
    doctor: "",
    department: "",
    diagnosis: "",
    prescriptions: [] as PrescriptionData[],
    legacyPrescription: "",
    chiefComplaints: "",
    examination: "",
    advice: "",
    summary: "",
    remarks: "",
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pharmacyMedicines, setPharmacyMedicines] = useState<any[]>([]);
  const [currentPrescription, setCurrentPrescription] = useState<PrescriptionData>({ medicineName: "", dose: "1 Tablet", frequency: "1-0-1", timing: "After Food", days: "5" });
  const [templateId, setTemplateId] = useState<string | null>(null);

  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    getMedicines().then(setPharmacyMedicines).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPatient && selectedPatient.opNumber) {
      let parsedPrescriptions = [];
      let legacyPrescription = "";
      if (selectedPatient.prescription) {
         try {
            const parsed = JSON.parse(selectedPatient.prescription);
            if (Array.isArray(parsed)) {
              parsedPrescriptions = parsed;
            } else {
              legacyPrescription = selectedPatient.prescription;
            }
         } catch(e) {
            legacyPrescription = selectedPatient.prescription;
         }
      }

      let parsedNotes = { 
         chiefComplaints: selectedPatient.complaint || "", 
         examination: "", 
         advice: "", 
         summary: "", 
         remarks: "", 
         vitals: { bp: "", pulse: "", temp: "", spo2: "", weight: "", height: "" },
         investigations: [],
         otProcedures: []
      };
      if (selectedPatient.clinicalNotes) {
         try {
            const notes = JSON.parse(selectedPatient.clinicalNotes);
            parsedNotes = {
               chiefComplaints: notes.chiefComplaints || selectedPatient.complaint || "",
               examination: notes.examination || "",
               advice: notes.advice || "",
               summary: notes.summary || "",
               remarks: notes.remarks || "",
               vitals: notes.vitals || { bp: "", pulse: "", temp: "", spo2: "", weight: "", height: "" },
               investigations: notes.investigations || [],
               otProcedures: notes.otProcedures || []
            };
         } catch(e) {
            parsedNotes.examination = selectedPatient.clinicalNotes;
         }
      }

      let formattedDate = "";
      if (selectedPatient.followUpDate) {
         try {
             formattedDate = new Date(selectedPatient.followUpDate).toISOString().split('T')[0];
         } catch (e) {
             formattedDate = selectedPatient.followUpDate;
         }
      }

      setFormData({
        opNumber: selectedPatient.opNumber || "",
        patientName: selectedPatient.patientName || selectedPatient.fullName || "",
        doctor: selectedPatient.doctor || "",
        department: selectedPatient.department || "Orthopaedics",
        diagnosis: selectedPatient.diagnosis || "",
        prescriptions: parsedPrescriptions,
        legacyPrescription: legacyPrescription,
        chiefComplaints: parsedNotes.chiefComplaints,
        examination: parsedNotes.examination,
        advice: parsedNotes.advice,
        summary: parsedNotes.summary,
        remarks: parsedNotes.remarks,
        followUpDate: formattedDate,
        vitals: parsedNotes.vitals,
        investigations: parsedNotes.investigations,
        otProcedures: parsedNotes.otProcedures
      });
      
      api.get(`/patients/record?opNumber=${encodeURIComponent(selectedPatient.opNumber)}`)
        .then(res => {
          setHistory(res.data);
        })
        .catch(console.error);

    } else {
      setFormData({
        opNumber: "", patientName: "", doctor: "", department: "", diagnosis: "", prescriptions: [], legacyPrescription: "",
        chiefComplaints: "", examination: "", advice: "", summary: "", remarks: "", followUpDate: "",
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

  const handleAddPrescription = () => {
    if (!currentPrescription.medicineName || !currentPrescription.dose || !currentPrescription.frequency || !currentPrescription.timing || !currentPrescription.days) {
      setErrors(prev => ({ ...prev, prescription: "Please fill all prescription fields before adding." }));
      return;
    }
    if (isNaN(Number(currentPrescription.days)) || Number(currentPrescription.days) <= 0) {
      setErrors(prev => ({ ...prev, prescription: "Days must be greater than 0." }));
      return;
    }
    setErrors(prev => ({ ...prev, prescription: "" }));
    setFormData(prev => ({ ...prev, prescriptions: [...prev.prescriptions, currentPrescription] }));
    setCurrentPrescription({ medicineName: "", dose: "1 Tablet", frequency: "1-0-1", timing: "After Food", days: "5" });
  };

  const handleSaveTemplate = async () => {
    if (!formData.chiefComplaints || !formData.examination) {
      return alert("Chief Complaint and Examination are required to save a template.");
    }
    try {
      await api.post("/templates", {
        chiefComplaint: formData.chiefComplaints,
        templateText: formData.examination
      });
      alert("Template Saved!");
      // Optionally re-fetch to get the ID, or just trust the next auto-load.
    } catch (e) {
      alert("Failed to save template.");
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateId) return;
    if (!confirm("Delete this template?")) return;
    try {
      await api.delete(`/templates/${templateId}`);
      setTemplateId(null);
      setFormData(prev => ({ ...prev, examination: "" }));
      alert("Template Deleted!");
    } catch (e) {
      alert("Failed to delete template.");
    }
  };

  // Auto-Load template when Chief Complaint changes
  useEffect(() => {
    if (formData.chiefComplaints && !history?.clinicalNotes?.examination && selectedPatient) {
      api.get(`/templates?complaint=${encodeURIComponent(formData.chiefComplaints)}`)
        .then(res => {
          if (res.data && res.data.templateText) {
            setFormData(prev => ({ ...prev, examination: res.data.templateText }));
            setTemplateId(res.data.id || null);
          } else {
            setTemplateId(null);
            // Don't wipe if user already typed something manually unless it's a fresh selection
          }
        })
        .catch(console.error);
    }
  }, [formData.chiefComplaints]);

  const handleRemovePrescription = (index: number) => {
    setFormData(prev => ({ ...prev, prescriptions: prev.prescriptions.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedPatient) return alert("Please select a patient from the queue");

    const newErrors: Record<string, string> = {};
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required before saving.";
    }
    if (formData.followUpDate) {
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (formData.followUpDate <= todayStr) {
        newErrors.followUpDate = "Follow-up date must be a future date.";
      }
    }

    if (formData.vitals.bp && !/^\d{2,3}\/\d{2,3}$/.test(formData.vitals.bp)) {
      newErrors.general = "BP must be in standard format (e.g. 120/80)";
    }
    if (formData.vitals.pulse && (isNaN(Number(formData.vitals.pulse)) || Number(formData.vitals.pulse) < 0 || Number(formData.vitals.pulse) > 300)) {
      newErrors.general = "Pulse must be a valid number (0-300)";
    }
    if (formData.vitals.temp && (isNaN(Number(formData.vitals.temp)) || Number(formData.vitals.temp) < 90 || Number(formData.vitals.temp) > 110)) {
      newErrors.general = "Temperature must be a valid number (90-110 °F)";
    }
    if (formData.vitals.spo2 && (isNaN(Number(formData.vitals.spo2)) || Number(formData.vitals.spo2) < 0 || Number(formData.vitals.spo2) > 100)) {
      newErrors.general = "SpO2 must be a valid percentage (0-100)";
    }

    if (
      !formData.diagnosis.trim() &&
      !formData.chiefComplaints.trim() &&
      !formData.examination.trim() &&
      formData.prescriptions.length === 0
    ) {
      newErrors.general = "Cannot submit an empty consultation.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const payload = {
        ...formData,
        prescription: JSON.stringify(formData.prescriptions),
        clinicalNotes: JSON.stringify({
          chiefComplaints: formData.chiefComplaints,
          examination: formData.examination,
          advice: formData.advice,
          summary: formData.summary,
          remarks: formData.remarks,
          vitals: formData.vitals,
          investigations: formData.investigations,
          otProcedures: formData.otProcedures,
          legacyPrescription: formData.legacyPrescription
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
      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-[#E2E8F0] text-[#64748B]">
        <p>Please select a patient from the queue to begin consultation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 h-full overflow-y-auto print:h-auto print:overflow-visible print:block">
      {/* Header Banner */}
      <div className="bg-[#0F172A] rounded-xl text-white p-5 flex justify-between items-center shadow-sm">
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
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#0F172A] font-bold mb-4">
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
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{v.label}</label>
              <input
                type="text"
                value={(formData.vitals as any)[v.field]}
                onChange={(e) => handleVitalChange(v.field, e.target.value)}
                placeholder={v.placeholder}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#0F172A] font-bold mb-4">
          <span className="text-xl">📋</span> Clinical Notes
        </h3>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Chief Complaints</label>
            <select 
              value={formData.chiefComplaints || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaints: e.target.value }))}
              className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm mb-2 outline-none"
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
              className="w-full h-24 p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Examination</label>
            <div className="flex gap-2 mb-2">
              <button 
                type="button" 
                onClick={handleSaveTemplate}
                className="text-[10px] font-bold px-2 py-1 bg-white border border-[#E2E8F0] rounded text-gray-700 hover:border-[#2563EB] transition-colors"
              >
                Save as Template
              </button>
              <button 
                type="button" 
                onClick={() => {
                   if (!formData.chiefComplaints) return alert("Select a Chief Complaint first.");
                   api.get(`/templates?complaint=${encodeURIComponent(formData.chiefComplaints)}`)
                     .then(res => {
                       if (res.data && res.data.templateText) {
                         setFormData(prev => ({ ...prev, examination: res.data.templateText }));
                         setTemplateId(res.data.id || null);
                       } else {
                         alert("No template found for this complaint.");
                       }
                     });
                }}
                className="text-[10px] font-bold px-2 py-1 bg-white border border-[#E2E8F0] rounded text-gray-700 hover:border-[#2563EB] transition-colors"
              >
                Load Template
              </button>
              {templateId && (
                <button 
                  type="button" 
                  onClick={handleDeleteTemplate}
                  className="text-[10px] font-bold px-2 py-1 bg-[#FEE2E2] text-[#2563EB] border border-[#2563EB]/30 rounded hover:border-[#2563EB] transition-colors ml-auto"
                >
                  Delete Template
                </button>
              )}
            </div>
            <textarea
              value={formData.examination}
              onChange={(e) => setFormData(prev => ({ ...prev, examination: e.target.value }))}
              placeholder="Clinical examination findings..."
              className="w-full h-[calc(100%-2.5rem)] p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Diagnosis</label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => {
                 setFormData(prev => ({ ...prev, diagnosis: e.target.value }));
                 if (errors.diagnosis) setErrors(prev => ({ ...prev, diagnosis: "" }));
              }}
              placeholder="Clinical diagnosis..."
              className={`w-full h-full p-3 border ${errors.diagnosis ? 'border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]' : 'border-[#E2E8F0] focus:border-[#2563EB]'} rounded-lg text-sm outline-none resize-none min-h-[120px]`}
            />
            {errors.diagnosis && <p className="text-[12px] text-[#2563EB] font-medium mt-1">{errors.diagnosis}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Summary</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Clinical summary..."
              className="w-full h-full p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none min-h-[120px]"
            />
          </div>
        </div>

        <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Prescription</label>
            
            {/* Add Medicine Inputs */}
            <div className="flex flex-col gap-4 mb-5 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Medicine (From Pharmacy)</label>
                  <select 
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none bg-white"
                    value={currentPrescription.medicineName}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, medicineName: e.target.value }))}
                  >
                    <option value="">-- Select Medicine --</option>
                    {pharmacyMedicines.map(med => (
                      <option key={med.medicineId} value={med.medicineName}>{med.medicineName} (Stock: {med.stock})</option>
                    ))}
                    {currentPrescription.medicineName && !pharmacyMedicines.find(m => m.medicineName === currentPrescription.medicineName) && (
                      <option value={currentPrescription.medicineName}>{currentPrescription.medicineName}</option>
                    )}
                  </select>
                </div>
                <div className="w-48">
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Dose</label>
                  <select 
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none bg-white"
                    value={currentPrescription.dose}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, dose: e.target.value }))}
                  >
                    <option value="1 Tablet">1 Tablet</option>
                    <option value="2 Tablets">2 Tablets</option>
                    <option value="0.5 Tablet">0.5 Tablet</option>
                    <option value="0.25 mg">0.25 mg</option>
                    <option value="5 ml">5 ml</option>
                    <option value="10 ml">10 ml</option>
                    <option value="1 Drop">1 Drop</option>
                    <option value="2 Drops">2 Drops</option>
                    <option value="1 Puff">1 Puff</option>
                    <option value="2 Puffs">2 Puffs</option>
                    <option value="Apply Locally">Apply Locally</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Frequency</label>
                  <select 
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none bg-white"
                    value={currentPrescription.frequency}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, frequency: e.target.value }))}
                  >
                    <option value="1-0-1">1-0-1</option>
                    <option value="1-1-1">1-1-1</option>
                    <option value="1-0-0">1-0-0</option>
                    <option value="0-1-0">0-1-0</option>
                    <option value="0-0-1">0-0-1</option>
                    <option value="0-1-1">0-1-1</option>
                    <option value="SOS">SOS</option>
                    <option value="Stat">Stat</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Timing</label>
                  <select 
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none bg-white"
                    value={currentPrescription.timing}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, timing: e.target.value }))}
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                    <option value="At Bedtime">At Bedtime</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Days</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none bg-white"
                    value={currentPrescription.days}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, days: e.target.value }))}
                    placeholder="e.g. 5"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddPrescription}
                  className="h-10 px-6 bg-[#2563EB] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1D4ED8] transition-colors"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              {errors.prescription && <p className="text-[12px] text-[#2563EB] font-medium mt-1">{errors.prescription}</p>}
            </div>

            {/* Prescriptions List */}
            {formData.prescriptions.length > 0 && (
              <div className="flex flex-col gap-3 mb-4">
                {formData.prescriptions.map((med, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border border-[#E2E8F0] rounded-xl bg-white shadow-sm">
                    <div>
                      <p className="font-bold text-[#0F172A] text-[15px]">{med.medicineName}</p>
                      <p className="text-[12px] text-[#64748B] mt-1">
                        {med.dose} • {med.timing}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-[#1E293B] text-[14px]">{med.frequency}</p>
                        <p className="text-[12px] text-[#64748B] mt-0.5">{med.days} Days</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePrescription(idx)} 
                        className="w-8 h-8 rounded-full bg-[#FEE2E2] text-[#2563EB] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legacy text area */}
            {formData.legacyPrescription && (
              <div className="mt-3">
                <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Legacy Notes</label>
                <textarea
                  value={formData.legacyPrescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, legacyPrescription: e.target.value }))}
                  className="w-full h-16 p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
                />
              </div>
            )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Advice & Instructions</label>
          <textarea
            value={formData.advice}
            onChange={(e) => setFormData(prev => ({ ...prev, advice: e.target.value }))}
            placeholder="Patient advice..."
            className="w-full h-20 p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
        <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">FOLLOW-UP DATE (OPTIONAL)</label>
        <div className="relative max-w-xs">
          {(() => {
             const tomorrow = new Date();
             tomorrow.setDate(tomorrow.getDate() + 1);
             const minDateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
             return (
               <input
                 type="date"
                 min={minDateStr}
                 value={formData.followUpDate}
                 onChange={(e) => {
                    setFormData(prev => ({ ...prev, followUpDate: e.target.value }));
                    if (errors.followUpDate) setErrors(prev => ({ ...prev, followUpDate: "" }));
                 }}
                 className={`w-full h-10 px-3 border ${errors.followUpDate ? 'border-[#2563EB]' : 'border-[#E2E8F0]'} rounded-lg text-sm outline-none focus:border-[#2563EB]`}
               />
             );
          })()}
          {errors.followUpDate && <p className="text-[12px] text-[#2563EB] font-medium mt-1">{errors.followUpDate}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#0F172A] font-bold mb-4">
          <span className="text-xl">🔬</span> Order Investigations
        </h3>
        
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Search & Add Test</label>
          <InvestigationSelect value={null} onChange={handleInvestigationSelect} className="max-w-md" />
        </div>

        {formData.investigations.length > 0 && (
          <div className="flex flex-col gap-2 max-w-md">
            {formData.investigations.map((test) => (
              <div key={test.code} className="flex items-center justify-between p-3 border border-[#E2E8F0] bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-[13px] text-[#1E293B] font-medium leading-tight">
                    {test.name}
                    <div className="text-[11px] text-gray-500 mt-0.5">{test.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#0F172A]">₹{test.price}</span>
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
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-[#0F172A] font-bold mb-4">
          <Scissors size={20} /> Schedule OT Procedure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otProceduresList.map((proc) => (
            <label key={proc.name} className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-lg cursor-pointer hover:border-[#2563EB] transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.otProcedures.includes(proc.name)}
                  onChange={() => handleOTToggle(proc.name)}
                  className="w-4 h-4 accent-[#2563EB]"
                />
                <span className="text-[13px] text-[#1E293B] font-medium">{proc.name}</span>
              </div>
              <span className="text-[13px] font-bold text-[#0F172A]">₹{proc.price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm mb-4">
        <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">REMARKS / ADDITIONAL NOTES</label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
          placeholder="Any extra remarks..."
          className="w-full h-20 p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
        />
      </div>

      {errors.general && (
        <div className="bg-[#FEE2E2] text-[#2563EB] p-3 rounded-lg border border-[#2563EB]/30 text-sm font-medium">
          {errors.general}
        </div>
      )}

      <div className="pb-8 flex gap-4 print:hidden">
        <button
          type="submit"
          disabled={loading}
          className="w-[200px] h-12 bg-[#2563EB] text-white font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Consultation"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-[120px] h-12 bg-white text-[#2563EB] border border-[#2563EB] font-bold rounded-lg hover:bg-[#FEE2E2] transition-colors"
        >
          Print
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Are you sure you want to cancel? All unsaved notes will be cleared.")) {
              setFormData({
                opNumber: "", patientName: "", doctor: "", department: "", diagnosis: "", prescriptions: [], legacyPrescription: "",
                chiefComplaints: "", examination: "", advice: "", summary: "", remarks: "", followUpDate: "",
                vitals: { bp: "", pulse: "", temp: "", spo2: "", weight: "", height: "" },
                investigations: [], otProcedures: []
              });
            }
          }}
          className="w-[120px] h-12 bg-white border border-[#E2E8F0] text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}