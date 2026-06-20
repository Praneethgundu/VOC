import { useState, useEffect, useRef } from "react";
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
  const [dotPhrases, setDotPhrases] = useState<Record<string, string>>({});
  const [smartChips, setSmartChips] = useState<Record<string, { exam: string[], diagnosis: string[] }>>({});
  const [currentPrescription, setCurrentPrescription] = useState<PrescriptionData>({ medicineName: "", dose: "1 Tablet", frequency: "1-0-1", timing: "After Food", days: "5" });
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const vitalsRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [history, setHistory] = useState<any>(null);

  // Print header/footer config fetched from admin settings
  const [printHeader, setPrintHeader] = useState<{
    logoUrl: string; clinicName: string; tagline: string;
    doctorName: string; credentials: string; specialization: string;
  } | null>(null);
  const [printFooter, setPrintFooter] = useState<{
    address: string; phone: string; email: string; website: string;
  } | null>(null);

  useEffect(() => {
    getMedicines().then(setPharmacyMedicines).catch(console.error);
    api.get("/macros/dot-phrases").then(res => setDotPhrases(res.data)).catch(console.error);
    api.get("/macros/smart-chips").then(res => setSmartChips(res.data)).catch(console.error);
    // Fetch print config
    api.get("/settings").then(res => {
      const d = res.data;
      if (d.printHeader) { try { setPrintHeader(JSON.parse(d.printHeader)); } catch {} }
      if (d.printFooter) { try { setPrintFooter(JSON.parse(d.printFooter)); } catch {} }
    }).catch(console.error);
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

  const handleVitalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = vitalsRefs.current[index + 1];
      if (nextInput) nextInput.focus();
    }
  };

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

  const handleTextMacro = (field: "examination" | "diagnosis" | "summary", val: string) => {
    let newVal = val;
    for (const [macro, text] of Object.entries(dotPhrases)) {
      if (newVal.includes(macro)) {
        newVal = newVal.replace(macro, text);
      }
    }
    setFormData(prev => ({ ...prev, [field]: newVal }));
  };

  const handleSaveTemplate = async () => {
    if (!templateName) return alert("Template name is required.");
    try {
      const payload = JSON.stringify({
        examination: formData.examination,
        diagnosis: formData.diagnosis,
        summary: formData.summary
      });
      await api.post("/templates", {
        chiefComplaint: templateName,
        templateText: payload
      });
      alert("Template Saved!");
      setShowTemplateModal(false);
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
            let parsed = { examination: "", diagnosis: "", summary: "" };
            try {
              parsed = JSON.parse(res.data.templateText);
            } catch (e) {
              parsed.examination = res.data.templateText; // legacy support
            }
            
            setFormData(prev => ({ 
              ...prev, 
              examination: prev.examination && prev.examination !== parsed.examination ? prev.examination + "\n" + parsed.examination : parsed.examination,
              diagnosis: prev.diagnosis && prev.diagnosis !== parsed.diagnosis ? prev.diagnosis + "\n" + parsed.diagnosis : parsed.diagnosis,
              summary: prev.summary && prev.summary !== parsed.summary ? prev.summary + "\n" + parsed.summary : parsed.summary
            }));
            setTemplateId(res.data.id || null);
          } else {
            setTemplateId(null);
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

      {/* ── Print-only Header ─────────────────────────────────────── */}
      {(printHeader?.clinicName || printHeader?.logoUrl || printHeader?.doctorName) && (
        <div className="hidden print:flex items-start justify-between border-b-2 border-gray-700 pb-3 mb-3">
          {/* Left: Logo + Clinic Name */}
          <div className="flex items-center gap-3">
            {printHeader.logoUrl && (
              <img
                src={printHeader.logoUrl}
                alt="Clinic Logo"
                className="h-16 w-auto object-contain"
                style={{ maxWidth: '90px' }}
              />
            )}
            <div>
              {printHeader.clinicName && (
                <p className="text-[16px] font-black text-black leading-tight">{printHeader.clinicName}</p>
              )}
              {printHeader.tagline && (
                <p className="text-[11px] text-gray-600 mt-0.5">{printHeader.tagline}</p>
              )}
            </div>
          </div>
          {/* Right: Doctor Details */}
          <div className="text-right max-w-[55%]">
            {printHeader.doctorName && (
              <p className="text-[14px] font-black text-black">{printHeader.doctorName}</p>
            )}
            {printHeader.credentials && (
              <div className="text-[9px] text-gray-600 whitespace-pre-line leading-snug mt-0.5">
                {printHeader.credentials}
              </div>
            )}
            {printHeader.specialization && (
              <div className="text-[9px] font-semibold text-black whitespace-pre-line leading-snug mt-0.5">
                {printHeader.specialization}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Header Banner */}
      <div className="bg-[#0F172A] rounded-xl text-white p-5 print:p-2 print:bg-transparent print:text-black print:border-b-2 print:border-slate-800 print:rounded-none flex justify-between items-center shadow-sm print:shadow-none print:mb-2">
        <div>
          <h2 className="text-xl font-bold print:text-lg">{formData.patientName}</h2>
          <p className="text-[13px] text-white/80 mt-1 print:text-xs print:text-slate-700">
            {formData.opNumber} • {history?.profile?.age || selectedPatient?.age || '--'}y/{history?.profile?.gender || selectedPatient?.gender || '--'} • {history?.profile?.bloodGroup || selectedPatient?.bloodGroup || '--'}
          </p>
        </div>
        <div className="flex gap-8 text-right print:gap-4">
          <div>
            <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider print:text-[9px] print:text-slate-500">Date</p>
            <p className="font-semibold text-sm print:text-xs">
              {new Date(selectedPatient.consultationDate || selectedPatient.createdAt || Date.now()).toLocaleDateString("en-GB")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider print:text-[9px] print:text-slate-500">Complaint</p>
            <p className="font-semibold text-sm print:text-xs">{selectedPatient.complaint || "N/A"}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider print:text-[9px] print:text-slate-500">Doctor</p>
            <p className="font-semibold text-sm print:text-xs">{formData.doctor || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider print:text-[9px] print:text-slate-500">Dept</p>
            <p className="font-semibold text-sm print:text-xs">{formData.department}</p>
          </div>
        </div>
      </div>

      {/* Print-only Vitals */}
      {(formData.vitals.bp || formData.vitals.pulse || formData.vitals.temp || formData.vitals.spo2 || formData.vitals.weight || formData.vitals.height) && (
        <div className="hidden print:block mb-2 pb-1.5 border-b border-gray-300 text-[11px] text-gray-800">
          <strong>Vitals:</strong>
          {formData.vitals.bp && <span className="ml-2">BP: {formData.vitals.bp}</span>}
          {formData.vitals.pulse && <span className="ml-2">| Pulse: {formData.vitals.pulse}</span>}
          {formData.vitals.temp && <span className="ml-2">| Temp: {formData.vitals.temp}</span>}
          {formData.vitals.spo2 && <span className="ml-2">| SpO2: {formData.vitals.spo2}</span>}
          {formData.vitals.weight && <span className="ml-2">| Wt: {formData.vitals.weight}kg</span>}
          {formData.vitals.height && <span className="ml-2">| Ht: {formData.vitals.height}cm</span>}
        </div>
      )}

      {/* Vitals */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm print:hidden">
        <h3 className="flex items-center gap-2 text-[#0F172A] font-bold mb-4">
          <Stethoscope size={16} /> Vitals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* Split BP */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">BP (Sys / Dia)</label>
            <div className="flex items-center gap-2">
              <input
                ref={(el) => { vitalsRefs.current[0] = el; }}
                type="text"
                value={formData.vitals.bp?.split("/")[0] || ""}
                onChange={(e) => {
                  if (!/^\d{0,3}$/.test(e.target.value)) return;
                  const d = formData.vitals.bp?.split("/")[1] || "";
                  handleVitalChange("bp", `${e.target.value}/${d}`);
                }}
                onKeyDown={(e) => handleVitalKeyDown(e, 0)}
                className="w-full h-10 px-3 text-center border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
              <span className="text-[#94A3B8] font-bold">/</span>
              <input
                ref={(el) => { vitalsRefs.current[1] = el; }}
                type="text"
                value={formData.vitals.bp?.split("/")[1] || ""}
                onChange={(e) => {
                  if (!/^\d{0,3}$/.test(e.target.value)) return;
                  const s = formData.vitals.bp?.split("/")[0] || "";
                  handleVitalChange("bp", `${s}/${e.target.value}`);
                }}
                onKeyDown={(e) => handleVitalKeyDown(e, 1)}
                className="w-full h-10 px-3 text-center border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
          </div>
          
          {/* Other Vitals */}
          {[
            { label: "PULSE (bpm)", field: "pulse", maxLen: 3, index: 2, regex: /^(?:[0-2]?\d{0,2}|300)$/ },
            { label: "TEMP (°F)", field: "temp", maxLen: 5, index: 3, regex: /^(?:[0-9]{1,2}|10\d|11[0-5])?(?:\.\d?)?$/ },
            { label: "SPO2 (%)", field: "spo2", maxLen: 3, index: 4, regex: /^(?:[1-9]?\d|100)?$/ },
            { label: "WEIGHT (kg)", field: "weight", maxLen: 5, index: 5, regex: /^(?:[0-2]?\d{0,2}|3[0-4]\d|350)?(?:\.\d?)?$/ },
            { label: "HEIGHT (cm)", field: "height", maxLen: 5, index: 6, regex: /^(?:[0-1]?\d{0,2}|2[0-4]\d|250)?(?:\.\d?)?$/ },
          ].map((v) => (
            <div key={v.field}>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{v.label}</label>
              <input
                ref={(el) => { vitalsRefs.current[v.index] = el; }}
                type="text"
                value={(formData.vitals as any)[v.field]}
                onChange={(e) => {
                  if (!v.regex.test(e.target.value)) return;
                  handleVitalChange(v.field, e.target.value);
                }}
                onKeyDown={(e) => handleVitalKeyDown(e, v.index)}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm print:p-0 print:border-0 print:shadow-none print:bg-transparent print:rounded-none print:mb-2">
        <div className="flex items-center justify-between mb-4 print:mb-1">
          <h3 className="flex items-center gap-2 text-[#0F172A] font-bold print:text-xs">
            <span className="text-xl print:text-sm">📋</span> Clinical Notes
          </h3>
          <button
            type="button"
            onClick={() => {
              setTemplateName(formData.chiefComplaints || "");
              setShowTemplateModal(true);
            }}
            className="text-xs font-bold px-3 py-1.5 bg-[#2563EB] text-white rounded-lg shadow-sm hover:bg-[#1D4ED8] transition-colors print:hidden"
          >
            Save as New Template
          </button>
        </div>
        
        {/* Print-only Clinical Notes Table */}
        <div className="hidden print:block mb-4 print:mb-2">
          <table className="w-full text-left border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="py-1 px-2 border border-gray-400 text-[10px] w-1/2">
                  <strong>Chief Complaints:</strong> {formData.chiefComplaints || "NA"}
                </td>
                <td className="py-1 px-2 border border-gray-400 text-[10px] w-1/2">
                  <strong>Examination:</strong> {formData.examination || "NA"}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-gray-400 text-[10px] w-1/2">
                  <strong>Diagnosis:</strong> {formData.diagnosis || "NA"}
                </td>
                <td className="py-1 px-2 border border-gray-400 text-[10px] w-1/2">
                  <strong>Summary:</strong> {formData.summary || "NA"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6 print:hidden">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Examination</label>
              {templateId && (
                <button 
                  type="button" 
                  onClick={handleDeleteTemplate}
                  className="text-[10px] font-bold px-2 py-0.5 bg-[#FEE2E2] text-[#2563EB] border border-[#2563EB]/30 rounded hover:border-[#2563EB] transition-colors"
                >
                  Delete Active Template
                </button>
              )}
            </div>
            <textarea
              value={formData.examination}
              onChange={(e) => handleTextMacro("examination", e.target.value)}
              placeholder="Clinical examination findings... (Tip: try typing .normalneck)"
              className="w-full h-32 p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
            />
            {formData.chiefComplaints && smartChips[formData.chiefComplaints]?.exam && (
              <div className="flex flex-wrap gap-2 mt-2">
                {smartChips[formData.chiefComplaints].exam.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, examination: prev.examination ? prev.examination + ", " + chip : chip }))}
                    className="text-[10px] font-medium px-2 py-1 bg-[#F1F5F9] text-[#475569] rounded hover:bg-[#E2E8F0] transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Print-only Diagnosis & Summary consolidated into table above */}

        <div className="grid grid-cols-2 gap-6 mb-6 print:hidden">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Diagnosis</label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => {
                 handleTextMacro("diagnosis", e.target.value);
                 if (errors.diagnosis) setErrors(prev => ({ ...prev, diagnosis: "" }));
              }}
              placeholder="Clinical diagnosis..."
              className={`w-full h-32 p-3 border ${errors.diagnosis ? 'border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]' : 'border-[#E2E8F0] focus:border-[#2563EB]'} rounded-lg text-sm outline-none resize-none`}
            />
            {errors.diagnosis && <p className="text-[12px] text-[#2563EB] font-medium mt-1">{errors.diagnosis}</p>}
            {formData.chiefComplaints && smartChips[formData.chiefComplaints]?.diagnosis && (
              <div className="flex flex-wrap gap-2 mt-2">
                {smartChips[formData.chiefComplaints].diagnosis.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, diagnosis: prev.diagnosis ? prev.diagnosis + ", " + chip : chip }));
                      if (errors.diagnosis) setErrors(prev => ({ ...prev, diagnosis: "" }));
                    }}
                    className="text-[10px] font-medium px-2 py-1 bg-[#EFF6FF] text-[#2563EB] rounded hover:bg-[#DBEAFE] transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Summary</label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleTextMacro("summary", e.target.value)}
              placeholder="Clinical summary..."
              className="w-full h-32 p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
            />
          </div>
        </div>

        <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2 print:text-[10px] print:text-gray-800 print:mb-0.5 print:mt-1">Prescription</label>
            
            {/* Add Medicine Inputs */}
            <div className="flex flex-col gap-4 mb-5 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] shadow-sm print:hidden">
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
              <div className="flex flex-col gap-3 mb-4 print:hidden">
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

            {/* Print-only Medicines Table */}
            {formData.prescriptions.length > 0 && (
              <div className="hidden print:block mb-4 print:mb-2">
                <table className="w-full text-left border-collapse border border-gray-400 mt-2 print:mt-1">
                  <thead>
                    <tr>
                      <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-12">S.No</th>
                      <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50">Medication Name</th>
                      <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-24">Dose / Qty</th>
                      <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-24">Frequency</th>
                      <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-16">Days</th>
                      <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-32">Instruction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.prescriptions.map((med, idx) => (
                      <tr key={idx}>
                        <td className="py-1 px-2 border border-gray-400 text-[10px] font-medium text-gray-800 text-center">{idx + 1}</td>
                        <td className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-800">
                          {med.medicineName}
                        </td>
                        <td className="py-1 px-2 border border-gray-400 text-[10px] text-gray-800">{med.dose}</td>
                        <td className="py-1 px-2 border border-gray-400 text-[10px] text-gray-800">{med.frequency}</td>
                        <td className="py-1 px-2 border border-gray-400 text-[10px] text-gray-800 text-center">{med.days}</td>
                        <td className="py-1 px-2 border border-gray-400 text-[10px] text-gray-800">{med.timing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

        {/* Print-only Advice */}
        {formData.advice && (
          <div className="hidden print:block mt-2 mb-1.5 text-[11px] text-gray-800">
            <strong>Advice & Instructions:</strong> <span className="whitespace-pre-wrap">{formData.advice}</span>
          </div>
        )}
        <div className="print:hidden">
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Advice & Instructions</label>
          <textarea
            value={formData.advice}
            onChange={(e) => setFormData(prev => ({ ...prev, advice: e.target.value }))}
            placeholder="Patient advice..."
            className="w-full h-20 p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] resize-none"
          />
        </div>
      </div>

      {/* Print-only Follow-up Date */}
      {formData.followUpDate && (
        <div className="hidden print:block mb-1.5 text-[11px] text-gray-800">
          <strong>Follow-up Date:</strong> {new Date(formData.followUpDate).toLocaleDateString("en-GB")}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm print:hidden">
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

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm print:p-0 print:border-0 print:shadow-none print:bg-transparent print:rounded-none print:mb-2">
        <h3 className="flex items-center gap-2 text-[#0F172A] font-bold mb-4 print:mb-1 print:text-xs">
          <span className="text-xl print:text-sm">🔬</span> Order Investigations
        </h3>
        
        <div className="mb-4 print:hidden">
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Search & Add Test</label>
          <InvestigationSelect value={null} onChange={handleInvestigationSelect} className="max-w-md" />
        </div>

        {formData.investigations.length > 0 && (
          <div className="flex flex-col gap-2 max-w-md print:hidden">
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

        {/* Print-only Investigations List */}
        {formData.investigations.length > 0 && (
          <div className="hidden print:block mt-2 print:mt-1">
            <table className="w-full text-left border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-12 text-center">S.No</th>
                  <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50">Investigation Name</th>
                  <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-32 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {formData.investigations.map((test, idx) => (
                  <tr key={test.code}>
                    <td className="py-1 px-2 border border-gray-400 text-[10px] font-medium text-gray-800 text-center">{idx + 1}</td>
                    <td className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-800">{test.name}</td>
                    <td className="py-1 px-2 border border-gray-400 text-[10px] font-medium text-gray-800 text-right">₹{test.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule OT Procedures */}
      <div className={`bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm print:p-0 print:border-0 print:shadow-none print:bg-transparent print:rounded-none print:mb-2 ${formData.otProcedures.length === 0 ? 'print:hidden' : ''}`}>
        <h3 className="flex items-center gap-2 text-[#0F172A] font-bold mb-4 print:mb-1 print:text-xs">
          <Scissors size={20} className="print:w-4 print:h-4" /> Schedule OT Procedure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:hidden">
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

        {/* Print-only OT Procedures List */}
        {formData.otProcedures.length > 0 && (
          <div className="hidden print:block mt-2 print:mt-1">
            <table className="w-full text-left border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-12 text-center">S.No</th>
                  <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50">Procedure Name</th>
                  <th className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-700 bg-gray-50 w-32 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {formData.otProcedures.map((proc, idx) => {
                  const procData = otProceduresList.find(p => p.name === proc);
                  return (
                    <tr key={proc}>
                      <td className="py-1 px-2 border border-gray-400 text-[10px] font-medium text-gray-800 text-center">{idx + 1}</td>
                      <td className="py-1 px-2 border border-gray-400 text-[10px] font-bold text-gray-800">{proc}</td>
                      <td className="py-1 px-2 border border-gray-400 text-[10px] font-medium text-gray-800 text-right">
                        {procData ? `₹${procData.price}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print-only Remarks */}
      {formData.remarks && (
        <div className="hidden print:block mb-1.5 text-[11px] text-gray-800">
          <strong>Remarks:</strong> <span className="whitespace-pre-wrap">{formData.remarks}</span>
        </div>
      )}

      {/* Remarks */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm mb-4 print:hidden">
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

      {/* ── Print-only Footer ─────────────────────────────────────── */}
      {(printFooter?.address || printFooter?.phone) && (
        <div className="hidden print:block mt-4 border-t-2 border-gray-700 pt-3 text-center">
          {printFooter.address && (
            <p className="text-[10px] text-gray-600 mb-1">{printFooter.address}</p>
          )}
          {printFooter.phone && (
            <p className="text-[13px] font-black text-black mb-1">📞 {printFooter.phone}</p>
          )}
          {(printFooter.email || printFooter.website) && (
            <p className="text-[10px] text-gray-600">
              {printFooter.email && `✉ ${printFooter.email}`}
              {printFooter.email && printFooter.website && "   •   "}
              {printFooter.website && `🌐 ${printFooter.website}`}
            </p>
          )}
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
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-[#0F172A]">Save as New Template</h3>
              <button type="button" onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Template Name / Chief Complaint</label>
              <input 
                type="text" 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB]"
                placeholder="e.g. Neck Pain"
              />
              <p className="text-xs text-gray-500 mt-2">This will bundle your current Examination, Diagnosis, and Summary fields.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-[#E2E8F0] flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8]"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}