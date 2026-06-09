"use client";

import { PatientRecord } from "@/services/patientRecordService";
import { Stethoscope, Activity, Scissors, Pill, Receipt, Calendar } from "lucide-react";
import { useMemo } from "react";

interface TimelineEvent {
  id: string;
  type: 'consultation' | 'investigation' | 'procedure' | 'pharmacy' | 'billing';
  date: Date;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  details: string;
}

export default function PatientTimeline({ record }: { record: PatientRecord }) {
  const events = useMemo(() => {
    const list: TimelineEvent[] = [];

    record.consultations.forEach(c => list.push({
      id: `cons-${c.id}`,
      type: 'consultation',
      date: new Date(c.consultationDate),
      title: 'Consultation',
      subtitle: `Dr. ${c.doctor}`,
      icon: <Stethoscope size={16} />,
      color: 'bg-blue-500',
      details: c.diagnosis || c.complaints
    }));

    record.investigations.forEach(i => list.push({
      id: `inv-${i.id}`,
      type: 'investigation',
      date: new Date(i.orderedDate),
      title: 'Investigation Ordered',
      subtitle: i.testName,
      icon: <Activity size={16} />,
      color: 'bg-purple-500',
      details: `Status: ${i.status}`
    }));

    record.procedures.forEach(p => list.push({
      id: `proc-${p.id}`,
      type: 'procedure',
      date: new Date(p.date),
      title: 'OT Procedure',
      subtitle: p.procedure,
      icon: <Scissors size={16} />,
      color: 'bg-red-500',
      details: `By Dr. ${p.doctor}`
    }));

    record.pharmacy.forEach(p => list.push({
      id: `phar-${p.id}`,
      type: 'pharmacy',
      date: new Date(p.dispensedDate),
      title: 'Pharmacy Dispensed',
      subtitle: `Medicine ID: ${p.medicineId}`,
      icon: <Pill size={16} />,
      color: 'bg-green-500',
      details: `Qty: ${p.quantity} | ₹${p.amount}`
    }));

    record.bills.forEach(b => list.push({
      id: `bill-${b.id}`,
      type: 'billing',
      date: new Date(b.date),
      title: 'Bill Generated',
      subtitle: `Total: ₹${b.total}`,
      icon: <Receipt size={16} />,
      color: 'bg-orange-500',
      details: `Status: ${b.status} | Mode: ${b.paymentMode}`
    }));

    // Sort descending (newest first)
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [record]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-500">
        <Calendar className="w-12 h-12 mb-4 text-gray-300" />
        <p>No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 py-6 border-l-2 border-gray-200 ml-4">
      {events.map((event, index) => (
        <div key={event.id} className="mb-8 relative">
          <div className={`absolute -left-10 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${event.color}`}>
            {event.icon}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition ml-2">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-[#1A2332]">{event.title}</h3>
              <span className="text-xs text-gray-500 font-semibold">{event.date.toLocaleString()}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">{event.subtitle}</p>
            <p className="text-sm text-gray-600">{event.details}</p>
          </div>
        </div>
      ))}
      <div className="absolute -left-[5px] bottom-0 w-3 h-3 bg-gray-300 rounded-full"></div>
    </div>
  );
}
