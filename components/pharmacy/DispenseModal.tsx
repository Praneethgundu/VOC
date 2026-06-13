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
  const [items, setItems] = useState<{medicineId: string, quantity: string}[]>([{medicineId: initialMedicineId || '', quantity: '1'}]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    getPatients().then(setPatients).catch(console.error);
  }, []);

  const searchOp = opNumber ? opNumber.trim().toLowerCase() : "";
  const patient = searchOp ? patients.find(p => p.opNumber && p.opNumber.trim().toLowerCase() === searchOp) : null;
  const patientName = searchOp 
    ? (patient ? (patient.fullName || patient.patientName || patient.name || 'Unknown Name') : 'Patient not found')
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!opNumber) {
      setError("OP Number is required.");
      return;
    }

    // Validation
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.medicineId) {
        setError(`Please select a medicine for item ${i + 1}.`);
        return;
      }
      const selectedMedicine = medicines.find(m => m.medicineId === item.medicineId);
      const q = Number(item.quantity);
      if (isNaN(q) || q <= 0) {
        setError(`Quantity must be a valid number greater than 0 for item ${i + 1}.`);
        return;
      }
      if (selectedMedicine && q > selectedMedicine.stock) {
        setError(`Cannot dispense ${q} of ${selectedMedicine.medicineName}. Only ${selectedMedicine.stock} available.`);
        return;
      }
    }
    
    setLoading(true);
    try {
      await Promise.all(items.map(async (item) => {
        const selectedMedicine = medicines.find(m => m.medicineId === item.medicineId);
        const amount = selectedMedicine ? (Number(item.quantity) * Number(selectedMedicine.price)) : 0;
        return dispenseMedicine({
          medicineId: item.medicineId,
          opNumber,
          quantity: Number(item.quantity),
          amount
        });
      }));
      alert("Medicines Dispensed Successfully!");
      onSuccess();
      onClose();
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.response?.data?.message || e.message;
      alert("Failed to dispense: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = items.reduce((sum, item) => {
    const med = medicines.find(m => m.medicineId === item.medicineId);
    return sum + (med ? (Number(item.quantity) * Number(med.price)) : 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative my-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-[#1E293B]">
              <span className="text-[#2563EB] text-xl">💊</span>
              <h2 className="text-lg font-bold">Dispense Medicines</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Amount</p>
              <p className="text-xl font-black text-[#059669]">₹{grandTotal.toFixed(0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OP Number *</label>
              <input 
                value={opNumber} 
                onChange={(e) => setOpNumber(e.target.value)} 
                placeholder="OP-2024-001" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#059669] text-sm"
                required 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Patient Name</label>
              <input 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)} 
                placeholder="Name" 
                className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[#059669] text-sm bg-white"
                readOnly
              />
            </div>
          </div>

          <div className="max-h-[40vh] overflow-y-auto pr-2 mb-4 space-y-4">
            {items.map((item, index) => {
              const selectedMedicine = medicines.find(m => m.medicineId === item.medicineId);
              const totalAmount = selectedMedicine ? (Number(item.quantity) * Number(selectedMedicine.price)) : 0;
              return (
                <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100 relative">
                  {items.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => {
                        const newItems = [...items];
                        newItems.splice(index, 1);
                        setItems(newItems);
                      }}
                      className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-sm border border-gray-200 hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Medicine</label>
                    <select 
                      value={item.medicineId} 
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].medicineId = e.target.value;
                        setItems(newItems);
                      }} 
                      className="h-9 px-2 rounded-lg border border-[#2563EB] outline-none focus:ring-1 focus:ring-[#2563EB] text-sm bg-white"
                      required
                    >
                      <option value="">Select a medicine...</option>
                      {medicines.map(m => (
                        <option key={m.medicineId} value={m.medicineId} disabled={m.stock <= 0}>
                          {m.medicineName} — Stock: {m.stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-20 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Qty</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={selectedMedicine?.stock || 1} 
                      value={item.quantity} 
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = e.target.value;
                        setItems(newItems);
                      }} 
                      className="h-9 px-2 rounded-lg border border-gray-200 outline-none focus:border-[#059669] text-sm text-center"
                      required 
                    />
                  </div>
                  <div className="w-20 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount</label>
                    <div className="h-9 rounded-lg flex items-center justify-center font-bold text-[#0F172A] text-sm bg-white border border-gray-200">
                      ₹{totalAmount.toFixed(0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            type="button" 
            onClick={() => setItems([...items, { medicineId: '', quantity: '1' }])}
            className="mb-4 text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
          >
            + Add Another Medicine
          </button>

          {error && <p className="text-[12px] text-[#2563EB] font-medium mb-4">{error}</p>}

          <div className="flex gap-4 mt-2">
            <button type="submit" disabled={loading} className="flex-1 h-10 bg-[#059669] text-white font-bold rounded-lg hover:bg-[#047857] transition-colors text-sm">
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