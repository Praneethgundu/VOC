"use client";

import { useState, useEffect } from "react";
import { getPatients } from "@/services/patientService";
import { getPatientRecord, PatientRecord } from "@/services/patientRecordService";
import PatientSearchList from "./PatientSearchList";
import PatientDetailViewer from "./PatientDetailViewer";
import { toast } from "sonner";
import { ClipboardList, Calendar, Bell } from "lucide-react";

export default function PatientRecordsLayout() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOpNumber, setSelectedOpNumber] = useState<string | null>(null);
  const [recordData, setRecordData] = useState<PatientRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (e) {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSelectPatient = async (opNumber: string) => {
    setSelectedOpNumber(opNumber);
    setRecordLoading(true);
    setRecordData(null);
    try {
      const data = await getPatientRecord(opNumber);
      setRecordData(data);
    } catch (e) {
      toast.error("Failed to fetch patient records");
      setSelectedOpNumber(null);
    } finally {
      setRecordLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] print:bg-white print:block print:h-auto">
      {/* Custom Header Matching Screenshot */}
      <div className="flex justify-between items-center bg-white px-8 py-5 border-b border-[#E2E8F0] print:hidden">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A]">Patient Records</h1>
          <p className="text-[14px] text-gray-500">Search and view comprehensive patient history</p>
        </div>
        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 bg-white shadow-sm">
            <Calendar size={16} className="text-[#2563EB]" />
            {currentDate}
          </div>
          <button className="relative p-2.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 p-8 gap-8 overflow-hidden bg-[#F8F9FA] print:p-0 print:overflow-visible print:block print:bg-white">
        {/* Left Panel: Search Card */}
        <div className="w-[360px] bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#E2E8F0] flex flex-col h-full overflow-hidden shrink-0 print:hidden">
          <PatientSearchList 
            patients={patients} 
            loading={loading} 
            selectedOpNumber={selectedOpNumber}
            onSelect={handleSelectPatient} 
          />
        </div>

        {/* Right Panel: Detail or Empty State */}
        <div className="flex-1 h-full overflow-y-auto rounded-xl print:overflow-visible print:h-auto print:w-full print:block">
          {!selectedOpNumber ? (
            <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-[#64748B]" />
              </div>
              <h2 className="text-[16px] font-semibold text-[#64748B]">Select a patient to view full records</h2>
            </div>
          ) : recordLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F172A]"></div>
            </div>
          ) : recordData ? (
            <PatientDetailViewer record={recordData} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
