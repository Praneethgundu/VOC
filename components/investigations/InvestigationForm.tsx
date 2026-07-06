import React, { useState, useEffect } from 'react';
import { Microscope, X } from 'lucide-react';
import { addInvestigation } from '@/services/investigationService';
import { getPatients } from '@/services/patientService';
import InvestigationSelect, { InvestigationMasterData } from './InvestigationSelect';

interface InvestigationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}



const DOCTORS = [
  'Dr. Vinay'
];

export default function InvestigationForm({ onClose, onSuccess }: InvestigationFormProps) {
  const [opNumber, setOpNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedTests, setSelectedTests] = useState<InvestigationMasterData[]>([]);
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    getPatients().then(setPatients).catch(console.error);
  }, []);

  useEffect(() => {
    if (opNumber) {
      const searchOp = opNumber.trim().toLowerCase();
      const patient = patients.find(p => p.opNumber && p.opNumber.trim().toLowerCase() === searchOp);
      if (patient) {
        setPatientName(patient.fullName || patient.patientName || "Unknown Name");
      } else {
        setPatientName('Patient not found');
      }
    } else {
      setPatientName('');
    }
  }, [opNumber, patients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!opNumber.trim() || !patientName.trim()) {
      setError("OP Number and Patient Name are required");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(patientName)) {
      setError("Patient Name cannot contain numbers or special characters");
      return;
    }
    if (selectedTests.length === 0) {
      setError("Please select at least one test to order");
      return;
    }
    if (!doctor) {
      setError("Ordering doctor is required");
      return;
    }
    
    setLoading(true);
    try {
      await Promise.all(selectedTests.map(test => 
        addInvestigation({
          opNumber,
          patientName,
          testName: test.name,
          doctor,
          amount: test.price || 0,
          status: 'Pending'
        })
      ));
      alert("Tests Ordered Successfully!");
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
            <div className="flex items-center gap-2 text-[#1E293B]">
              <span className="text-[#0F172A] text-xl">🔬</span>
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
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm"
                required 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Patient Name *</label>
              <input 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)} 
                placeholder="Full name" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search & Add Tests *</label>
            <InvestigationSelect 
              value={null} 
              onChange={(test) => {
                if (test && !selectedTests.find(t => t.code === test.code)) {
                  setSelectedTests([...selectedTests, test]);
                }
              }} 
            />
            {selectedTests.length > 0 && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-[120px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {selectedTests.map((test, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-gray-100 rounded-md p-2 shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{test.name}</p>
                        <p className="text-[10px] font-medium text-gray-500">₹{test.price || 0} • {test.category}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedTests(selectedTests.filter(t => t.code !== test.code))}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ordered By</label>
            <select 
              value={doctor} 
              onChange={(e) => setDoctor(e.target.value)} 
              className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm bg-white"
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
            <button type="submit" disabled={loading} className="flex-1 h-10 bg-[#2563EB] text-white font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors text-sm">
              {loading ? "Ordering..." : "Order Test"}
            </button>
            <button type="button" onClick={onClose} className="w-[100px] h-10 border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 rounded-lg transition-colors text-sm bg-white shadow-sm">
              Cancel
            </button>
          </div>
          {error && <p className="text-[12px] text-[#2563EB] font-medium mt-3">{error}</p>}
        </div>
      </form>
    </div>
  );
}