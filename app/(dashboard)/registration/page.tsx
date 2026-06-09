"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import RegistrationForm from "@/components/registration/RegistrationForm";
import PatientTable from "@/components/registration/PatientTable";
import { useState } from "react";

export default function RegistrationPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Patient Registration" breadcrumb="Registration" />
        <main className="flex-1 p-6 space-y-6">
          <RegistrationForm onSuccess={() => setRefreshKey(k => k + 1)} />
          <PatientTable key={refreshKey} />
        </main>
      </div>
    </div>
  );
}