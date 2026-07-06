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
  'Dr. Vinay'
];

export default function OTForm({ onClose, onSuccess }: OTFormProps) {
  const [opNumber, setOpNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const d = new Date();
  const initDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(initDate);
  const [time, setTime] = useState('');
  const [procedure, setProcedure] = useState(PROCEDURES[0]);
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [fee, setFee] = useState('');
  const [notes, setNotes] = useState('');
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
        setAge(patient.age?.toString() || '');
      } else {
        setPatientName('Patient not found');
        setAge('');
      }
    } else {
      setPatientName('');
      setAge('');
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
    if (age) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
        setError("Age must be between 1 and 150");
        return;
      }
    }
    if (!procedure) {
      setError("Procedure is required");
      return;
    }
    if (!doctor) {
      setError("Doctor is required");
      return;
    }
    if (!time) {
      setError("Time is required");
      return;
    }
    const cost = Number(fee);
    if (isNaN(cost) || cost < 0 || fee === '') {
      setError("Fee must be a valid number >= 0");
      return;
    }
    
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
        date: time ? `${date}T${time}:00` : `${date}T00:00:00`,
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
            <div className="flex items-center gap-2 text-[#1E293B]">
              <span className="text-[#2563EB] text-xl">✂️</span>
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

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Age</label>
              <input 
                type="number"
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                placeholder="Years" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</label>
              <input 
                type="date"
                value={date}
                min={initDate}
                onChange={(e) => setDate(e.target.value)} 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm cursor-pointer"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Time</label>
              <div className="relative">
                <input 
                  type="time"
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="h-10 px-3 w-full rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Procedure</label>
            <select 
              value={procedure} 
              onChange={(e) => setProcedure(e.target.value)} 
              className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm bg-white"
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
              className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm bg-white"
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
              className="h-10 px-3 w-[50%] rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notes</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Notes..." 
              className="h-20 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#2563EB] text-sm resize-none"
            ></textarea>
          </div>

          {error && <p className="text-[12px] text-[#2563EB] font-medium mb-4">{error}</p>}

          <div className="flex gap-4 mt-2">
            <button type="submit" disabled={loading} className="flex-1 h-10 bg-[#2563EB] text-white font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors text-sm shadow-sm">
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
