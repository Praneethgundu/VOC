"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { getAdminEodReport, getReceptionEodReport, getDoctorEodReport, getPharmacyEodReport } from "@/services/reportService";
import AdminMasterEOD from "@/components/reports/AdminMasterEOD";
import ReceptionEOD from "@/components/reports/ReceptionEOD";
import DoctorEOD from "@/components/reports/DoctorEOD";
import PharmacyEOD from "@/components/reports/PharmacyEOD";

export default function AdminEODPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("master");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("Dr. Vinay");

  useEffect(() => {
    fetchReport();
  }, [selectedDate, activeTab, selectedDoctor]);

  const handleTabChange = (tab: string) => {
    setLoading(true);
    setReport(null);
    setActiveTab(tab);
  };

  const fetchReport = async () => {
    setLoading(true);
    setReport(null);
    try {
      if (activeTab === "master") setReport(await getAdminEodReport(selectedDate));
      else if (activeTab === "reception") setReport(await getReceptionEodReport(selectedDate));
      else if (activeTab === "doctor") setReport(await getDoctorEodReport(selectedDate, selectedDoctor));
      else if (activeTab === "pharmacy") setReport(await getPharmacyEodReport(selectedDate));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderActiveReport = () => {
    if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Generating Live EOD Report...</div>;
    if (!report) return <div className="p-10 text-center text-red-500">Failed to load report.</div>;

    switch (activeTab) {
      case "master": return <AdminMasterEOD report={report} />;
      case "reception": return <ReceptionEOD report={report} />;
      case "doctor": return <DoctorEOD report={report} />;
      case "pharmacy": return <PharmacyEOD report={report} />;
      default: return null;
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <div className="print:hidden">
        <Sidebar />
      </div>
      
      <div className="ml-[248px] print:ml-0 flex-1 flex flex-col min-h-screen print:bg-white">
        <div className="print:hidden">
          <Navbar pageTitle="Admin Master EOD Report" breadcrumb="Reports" />
        </div>
        
        <main className="flex-1 p-6 print:p-0 flex flex-col items-center">
          <div className="w-full max-w-5xl mb-6 print:hidden flex justify-between items-center">
            
            <div className="flex gap-2">
              <button onClick={() => handleTabChange("master")} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'master' ? 'bg-[#0F172A] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Master Summary</button>
              <button onClick={() => handleTabChange("reception")} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'reception' ? 'bg-[#0F172A] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Reception EOD</button>
              <button onClick={() => handleTabChange("doctor")} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'doctor' ? 'bg-[#0F172A] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Doctor EOD</button>
              <button onClick={() => handleTabChange("pharmacy")} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'pharmacy' ? 'bg-[#0F172A] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Pharmacy EOD</button>
            </div>

            <div className="flex items-center gap-3">
              {activeTab === "doctor" && (
                <>
                  <label className="text-sm font-semibold text-gray-600">Select Doctor:</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0F172A] bg-white mr-2"
                  >
                    <option value="Dr. Vinay">Dr. Vinay</option>
                  </select>
                </>
              )}
              <label className="text-sm font-semibold text-gray-600">Select Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0F172A]"
              />
            </div>
          </div>

          {renderActiveReport()}
        </main>
      </div>
    </div>
  );
}
