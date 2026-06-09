import React, { useState, useEffect } from 'react';
import { Pill, X } from 'lucide-react';
import { dispenseMedicine } from '@/services/pharmacyService';
import { getPatients } from '@/services/patientService';

interface DispenseModalProps {
  initialMedicineId?: string;
  medicines: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function DispenseModal({ initialMedicineId, medicines, onClose, onSuccess }: DispenseModalProps) {
  const [opNumber, setOpNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [medicineId, setMedicineId] = useState(initialMedicineId || '');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    getPatients().then(setPatients).catch(console.error);
  }, []);

  useEffect(() => {
    if (opNumber) {
      const searchOp = opNumber.trim().toLowerCase();
      const patient = patients.find(p => p.opNumber && p.opNumber.trim().toLowerCase() === searchOp);
      if (patient) {
        setPatientName(patient.fullName || patient.patientName || patient.name || 'Unknown Name');
      } else {
        setPatientName('Patient not found');
      }
    }
  }, [opNumber, patients]);

  const selectedMedicine = medicines.find(m => m.medicineId === medicineId);
  const totalAmount = selectedMedicine ? (Number(quantity) * Number(selectedMedicine.price)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opNumber || !quantity || !selectedMedicine || Number(quantity) <= 0 || Number(quantity) > selectedMedicine.quantity) return;
    
    setLoading(true);
    try {
      await dispenseMedicine({
        medicineId: selectedMedicine.medicineId,
        opNumber,
        quantity: Number(quantity),
        amount: totalAmount
      });
      alert("Medicine Dispensed Successfully!");
      onSuccess();
      onClose();
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.response?.data?.message || e.message;
      alert("Failed to dispense: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6 text-[#1A2332]">
            <span className="text-[#E12D45] text-xl">💊</span>
            <h2 className="text-lg font-bold">Dispense Medicine</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OP Number *</label>
              <input 
                value={opNumber} 
                onChange={(e) => setOpNumber(e.target.value)} 
                placeholder="OP-2024-001" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#16A34A] text-sm"
                required 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Patient Name</label>
              <input 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)} 
                placeholder="Name" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#16A34A] text-sm bg-white"
                readOnly
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Medicine</label>
            <select 
              value={medicineId} 
              onChange={(e) => setMedicineId(e.target.value)} 
              className="h-10 px-3 rounded-lg border border-[#E12D45] outline-none focus:ring-1 focus:ring-[#E12D45] text-sm bg-white"
              required
            >
              <option value="">Select a medicine...</option>
              {medicines.map(m => (
                <option key={m.medicineId} value={m.medicineId}>
                  {m.medicineName} — Stock: {m.quantity} Tablets
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
              <input 
                type="number" 
                min="1" 
                max={selectedMedicine?.quantity || 1} 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#16A34A] text-sm"
                required 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount</label>
              <div className="h-10 rounded-lg flex items-center px-3 font-bold text-[#800020] text-lg bg-gray-50">
                ₹{totalAmount.toFixed(0)}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" disabled={loading} className="flex-1 h-10 bg-[#16A34A] text-white font-bold rounded-lg hover:bg-[#15803D] transition-colors text-sm">
              {loading ? "Saving..." : "Dispense"}
            </button>
            <button type="button" onClick={onClose} className="w-[100px] h-10 border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 rounded-lg transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}