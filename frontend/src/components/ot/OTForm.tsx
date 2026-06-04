import React, { useState, useEffect } from 'react';
import { Scissors, X, Clock } from 'lucide-react';
import { getPatients } from '@/services/patientService';

interface OTFormProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const PROCEDURES = [
  'Wound Suturing',
  'Joint Aspiration',
  'Casting / Splinting',
  'Tendon Repair',
  'Hardware Removal',
  'Carpal Tunnel Release'
];

const DOCTORS = [
  'Dr. Meera Patel',
  'Dr. Sunitha Devi',
  'Dr. Ramesh Kumar',
  'Dr. Anil Reddy'
];

export default function OTForm({ onClose, onSuccess }: OTFormProps) {
  const [opNumber, setOpNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [time, setTime] = useState('');
  const [procedure, setProcedure] = useState(PROCEDURES[0]);
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [fee, setFee] = useState('');
  const [notes, setNotes] = useState('');
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
        setAge(patient.age?.toString() || '');
      } else {
        setPatientName('');
        setAge('');
      }
    }
  }, [opNumber, patients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opNumber || !patientName || !procedure || !doctor) return;
    
    setLoading(true);
    try {
      // Simulate API call using the parent's onSuccess handler which will do the real call
      await onSuccess({
        opNumber,
        patientName,
        age,
        time,
        procedure,
        doctor,
        fee,
        notes,
        date: new Date().toISOString().split("T")[0],
        status: 'IN PROGRESS' // Default to in progress for minor OT like screenshot? Actually backend uses 'Scheduled'. Let's let backend default or pass 'IN PROGRESS'
      });
    } catch (e: any) {
      alert("Failed to schedule procedure: " + (e.response?.data?.message || e.message));
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
              <span className="text-[#E12D45] text-xl">✂️</span>
              <h2 className="text-xl font-bold">Schedule Minor OT Procedure</h2>
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Age</label>
              <input 
                type="number"
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                placeholder="Years" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Time</label>
              <div className="relative">
                <input 
                  type="time"
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="h-10 px-3 w-full rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Procedure</label>
            <select 
              value={procedure} 
              onChange={(e) => setProcedure(e.target.value)} 
              className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm bg-white"
              required
            >
              {PROCEDURES.map((p, i) => <option key={i} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Doctor</label>
            <select 
              value={doctor} 
              onChange={(e) => setDoctor(e.target.value)} 
              className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm bg-white"
              required
            >
              {DOCTORS.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fee (₹)</label>
            <input 
              type="number"
              value={fee} 
              onChange={(e) => setFee(e.target.value)} 
              placeholder="800" 
              className="h-10 px-3 w-[50%] rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notes</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Notes..." 
              className="h-20 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#E12D45] text-sm resize-none"
            ></textarea>
          </div>

          <div className="flex gap-4 mt-2">
            <button type="submit" disabled={loading} className="flex-1 h-10 bg-[#E12D45] text-white font-bold rounded-lg hover:bg-[#C01D35] transition-colors text-sm shadow-sm">
              {loading ? "Scheduling..." : "Schedule"}
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
