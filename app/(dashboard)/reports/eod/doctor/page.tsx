"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { getDoctorEodReport } from "@/services/reportService";
import { useAuth } from "@/hooks/useAuth";
import DoctorEOD from "@/components/reports/DoctorEOD";

export default function DoctorEODPage() {
  const { currentUser } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (currentUser?.username) fetchReport();
  }, [selectedDate, currentUser]);

  const fetchReport = async () => {
    setLoading(true);
    setReport(null);
    try {
      setReport(await getDoctorEodReport(selectedDate, currentUser?.username));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <div className="print:hidden">
        <Sidebar />
      </div>
      
      <div className="ml-[248px] print:ml-0 flex-1 flex flex-col min-h-screen print:bg-white">
        <div className="print:hidden">
          <Navbar pageTitle="Doctor EOD Report" breadcrumb="Reports" />
        </div>
        
        <main className="flex-1 p-6 print:p-0 flex flex-col items-center">
          <div className="w-full max-w-5xl mb-6 print:hidden flex justify-end items-center">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-600">Select Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800020]"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500 font-medium">Generating Live EOD Report...</div>
          ) : !report ? (
            <div className="p-10 text-center text-red-500">Failed to load report.</div>
          ) : (
            <DoctorEOD report={report} />
          )}
        </main>
      </div>
    </div>
  );
}
