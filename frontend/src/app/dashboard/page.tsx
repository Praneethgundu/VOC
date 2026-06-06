"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentPatients from "@/components/dashboard/RecentPatients";
import { useEffect, useState } from "react";
import { getPatients } from "@/services/patientService";
import { getConsultations } from "@/services/consultationService";
import { getInvestigations } from "@/services/investigationService";
import { getBills } from "@/services/billingService";

import { useAuth } from "@/hooks/useAuth";
import { 
  getReceptionEodReport, 
  getDoctorEodReport, 
  getPharmacyEodReport, 
  getAdminEodReport 
} from "@/services/reportService";

export default function DashboardPage() {
  const { role, currentUser } = useAuth();
  const [eodSummary, setEodSummary] = useState<any>(null);

  useEffect(() => {
    if (role) fetchEodSummary();
  }, [role]);

  const fetchEodSummary = async () => {
    try {
      if (role === "RECEPTIONIST") setEodSummary(await getReceptionEodReport());
      else if (role === "DOCTOR") setEodSummary(await getDoctorEodReport(undefined, currentUser?.username));
      else if (role === "PHARMACIST") setEodSummary(await getPharmacyEodReport());
      else if (role === "ADMIN") setEodSummary(await getAdminEodReport());
    } catch {
      // ignore
    }
  };

  const getRoleWidgets = () => {
    if (!eodSummary || !eodSummary.stats) return [];
    const stats = eodSummary.stats;
    
    if (role === "RECEPTIONIST") return [
      { label: "Today's Registrations", value: stats.totalRegistrations, color: "#E12D45" },
      { label: "Collections", value: `₹${stats.collectionsReceived || 0}`, color: "#16A34A" },
      { label: "Pending Bills", value: stats.billsPending, color: "#F59E0B" },
    ];
    if (role === "DOCTOR") return [
      { label: "Today's Consultations", value: stats.patientsConsulted, color: "#2563EB" },
      { label: "Pending Patients", value: stats.patientsPending, color: "#F59E0B" },
      { label: "Investigations Ordered", value: stats.investigationsOrdered, color: "#8B5CF6" },
    ];
    if (role === "PHARMACIST") return [
      { label: "Medicines Dispensed", value: stats.medicinesDispensed, color: "#10B981" },
      { label: "Revenue", value: `₹${stats.revenueGenerated || 0}`, color: "#16A34A" },
      { label: "Low Stock Alerts", value: stats.lowStockMedicines, color: "#EF4444" },
    ];
    // Admin default
    return [
      { label: "Total Registrations", value: stats.totalRegistrations, color: "#E12D45" },
      { label: "Total Consultations", value: stats.totalConsultations, color: "#2563EB" },
      { label: "Total Revenue", value: `₹${stats.totalRevenue || 0}`, color: "#16A34A" },
      { label: "Pending Revenue", value: `₹${stats.pendingRevenue || 0}`, color: "#F59E0B" },
    ];
  };

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />

      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Dashboard" breadcrumb="Overview" />

        <main className="flex-1 p-6 space-y-6">
          {/* Page title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="text-[#6B7280] text-[13px] mt-1">
                Welcome back — here&apos;s what&apos;s happening today.
              </p>
            </div>
          </div>

          {/* Stats */}
          <StatsCards />

          {/* Charts + Recent */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3">
              <RevenueChart />
            </div>
            <div className="xl:col-span-2">
              {/* Quick summary card */}
              <div
                className="bg-white rounded-xl border border-[#ECECEC] p-6 h-full"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)",
                }}
              >
                <h2 className="section-heading mb-5">Today&apos;s Summary</h2>
                <div className="space-y-4">
                  {getRoleWidgets().map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[13px] text-[#6B7280]">{item.label}</span>
                      </div>
                      <span
                        className="text-[15px] font-bold"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="mt-6 pt-5 border-t border-[#ECECEC] grid grid-cols-2 gap-2">
                  <a
                    href="/registration"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#FFF0F2] text-[#E12D45] text-[12px] font-semibold hover:bg-[#FFE0E4] transition-colors"
                  >
                    + Register
                  </a>
                  <a
                    href="/billing"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#FDF8F8] border border-[#ECECEC] text-[#6B7280] text-[12px] font-semibold hover:border-[rgba(128,0,32,0.2)] hover:text-[#800020] transition-colors"
                  >
                    New Bill
                  </a>
                  <a
                    href="/pharmacy"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#FDF8F8] border border-[#ECECEC] text-[#6B7280] text-[12px] font-semibold hover:border-[rgba(128,0,32,0.2)] hover:text-[#800020] transition-colors"
                  >
                    Dispense Meds
                  </a>
                  <a
                    href="/investigations"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#FDF8F8] border border-[#ECECEC] text-[#6B7280] text-[12px] font-semibold hover:border-[rgba(128,0,32,0.2)] hover:text-[#800020] transition-colors"
                  >
                    Order Test
                  </a>
                  <a
                    href="/reports/eod"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#FDF8F8] border border-[#ECECEC] text-[#6B7280] text-[12px] font-semibold hover:border-[rgba(128,0,32,0.2)] hover:text-[#800020] transition-colors col-span-2"
                  >
                    View Full EOD Report
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent patients table */}
          <RecentPatients />
        </main>
      </div>
    </div>
  );
}