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

  useEffect(() => {
    fetchPatients();
  }, []);

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
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Custom Header Matching Screenshot */}
      <div className="flex justify-between items-center bg-white px-8 py-5 border-b border-[#ECECEC]">
        <div>
          <h1 className="text-[28px] font-bold text-[#800020]">Patient Records</h1>
          <p className="text-[14px] text-gray-500">Search and view comprehensive patient history</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E12D45] text-[#E12D45] rounded-full text-[12px] font-bold tracking-wide hover:bg-red-50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#E12D45]"></span>
            CONNECT EXCEL DB
          </button>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 bg-white shadow-sm">
            <Calendar size={16} className="text-[#E12D45]" />
            {currentDate}
          </div>
          <button className="relative p-2.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#E12D45] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 p-8 gap-8 overflow-hidden bg-[#F8F9FA]">
        {/* Left Panel: Search Card */}
        <div className="w-[360px] bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#ECECEC] flex flex-col h-full overflow-hidden shrink-0">
          <PatientSearchList 
            patients={patients} 
            loading={loading} 
            selectedOpNumber={selectedOpNumber}
            onSelect={handleSelectPatient} 
          />
        </div>

        {/* Right Panel: Detail or Empty State */}
        <div className="flex-1 h-full overflow-y-auto rounded-xl">
          {!selectedOpNumber ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6B7280]">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-[#6B7280]" />
              </div>
              <h2 className="text-[16px] font-semibold text-[#4B5563]">Select a patient to view full records</h2>
            </div>
          ) : recordLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800020]"></div>
            </div>
          ) : recordData ? (
            <PatientDetailViewer record={recordData} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
