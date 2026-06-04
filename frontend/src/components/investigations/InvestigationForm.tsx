import React, { useState, useEffect } from 'react';
import { Microscope, X } from 'lucide-react';
import { addInvestigation } from '@/services/investigationService';
import { getPatients } from '@/services/patientService';

interface InvestigationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TESTS = [
  { name: 'X-Ray Knee AP/Lat', price: 400 },
  { name: 'X-Ray Pelvis AP', price: 300 },
  { name: 'MRI Lumbar Spine', price: 4000 },
  { name: 'MRI Cervical Spine', price: 4000 },
  { name: 'DEXA Bone Density Scan', price: 1500 },
  { name: 'CT Scan Joint', price: 2500 },
  { name: 'Serum Uric Acid', price: 200 },
  { name: 'Serum Calcium', price: 150 },
  { name: 'CRP (C-Reactive Protein)', price: 300 },
  { name: 'Rheumatoid Factor (RA Test)', price: 350 },
  { name: 'Complete Blood Count (CBC)', price: 250 }
];

const DOCTORS = [
  'Dr. Meera Patel',
  'Dr. Ramesh Kumar',
  'Dr. Anil Reddy',
  'Dr. Sarah John'
];

export default function InvestigationForm({ onClose, onSuccess }: InvestigationFormProps) {
  const [opNumber, setOpNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [testName, setTestName] = useState(TESTS[0].name);
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [loading, setLoading] = useState(false);
  
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    getPatients().then(setPatients).catch(console.error);
  }, []);

  useEffect(() => {
    if (opNumber) {
      const patient = patients.find(p => p.opNumber === opNumber);
      if (patient) {
        setPatientName(patient.fullName);
      } else {
        setPatientName('');
      }
    }
  }, [opNumber, patients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opNumber || !patientName || !testName || !doctor) return;
    
    const selectedTest = TESTS.find(t => t.name === testName);
    
    setLoading(true);
    try {
      await addInvestigation({
        opNumber,
        patientName,
        testName,
        doctor,
        amount: selectedTest?.price || 0,
        status: 'Pending'
      });
      alert("Test Ordered Successfully!");
      onSuccess();
      onClose();
    } catch (e: any) {
      alert("Failed to order test: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-[#1A2332]">
              <span className="text-[#800020] text-xl">🔬</span>
              <h2 className="text-xl font-bold">Order Investigation</h2>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OP Number *</label>
              <input 
                value={opNumber} 
                onChange={(e) => setOpNumber(e.target.value)} 
                placeholder="OP-2024-001" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm"
                required 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Patient Name *</label>
              <input 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)} 
                placeholder="Full name" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Test</label>
            <select 
              value={testName} 
              onChange={(e) => setTestName(e.target.value)} 
              className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm bg-white"
              required
            >
              {TESTS.map((t, i) => (
                <option key={i} value={t.name}>
                  {t.name} — ₹{t.price}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ordered By</label>
            <select 
              value={doctor} 
              onChange={(e) => setDoctor(e.target.value)} 
              className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm bg-white"
              required
            >
              {DOCTORS.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" disabled={loading} className="flex-1 h-10 bg-[#E12D45] text-white font-bold rounded-lg hover:bg-[#C01D35] transition-colors text-sm">
              {loading ? "Ordering..." : "Order Test"}
            </button>
            <button type="button" onClick={onClose} className="w-[100px] h-10 border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 rounded-lg transition-colors text-sm bg-white shadow-sm">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}