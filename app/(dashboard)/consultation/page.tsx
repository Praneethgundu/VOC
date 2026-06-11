"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ConsultationForm from "@/components/consultation/ConsultationForm";
import ConsultationQueue from "@/components/consultation/ConsultationQueue";
import { useState } from "react";

export default function ConsultationPage() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="flex bg-[#FDF8F8] h-screen overflow-hidden print:block print:h-auto print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="ml-[248px] flex-1 flex flex-col h-screen print:ml-0 print:h-auto print:block">
        <div className="print:hidden">
          <Navbar pageTitle="Consultation" breadcrumb="Doctor's consultation and clinical notes" />
        </div>
        
        {/* Main Content Area: Side-by-Side */}
        <main className="flex-1 p-6 flex gap-6 overflow-hidden print:p-0 print:overflow-visible print:block">
          {/* Left Column: Queue (1/3 width approx) */}
          <div className="w-[350px] shrink-0 h-full overflow-hidden print:hidden">
            <ConsultationQueue 
              key={refreshTrigger}
              onSelect={setSelectedPatient} 
              selectedId={selectedPatient?.id} 
            />
          </div>

          {/* Right Column: Active Consultation Entry (2/3 width) */}
          <div className="flex-1 h-full overflow-hidden print:overflow-visible print:w-full print:block">
            <ConsultationForm 
              selectedPatient={selectedPatient} 
              onSave={() => {
                setSelectedPatient(null);
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}