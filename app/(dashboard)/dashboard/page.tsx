"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentPatients from "@/components/dashboard/RecentPatients";
import { useEffect, useState } from "react";
import Link from "next/link";
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
      if (role === "RECEPTIONIST") setEodSummary(await getAdminEodReport());
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
      { label: "Today's Registrations", value: stats.totalRegistrations, color: "#2563EB" },
      { label: "Collections", value: `₹${stats.collectionsReceived || 0}`, color: "#059669" },
      { label: "Pending Bills", value: stats.billsPending, color: "#92400E" },
    ];
    if (role === "DOCTOR") return [
      { label: "Today's Consultations", value: stats.patientsConsulted, color: "#2563EB" },
      { label: "Pending Patients", value: stats.patientsPending, color: "#92400E" },
      { label: "Investigations Ordered", value: stats.investigationsOrdered, color: "#8B5CF6" },
    ];
    if (role === "PHARMACIST") return [
      { label: "Medicines Dispensed", value: stats.medicinesDispensed, color: "#059669" },
      { label: "Revenue", value: `₹${stats.revenueGenerated || 0}`, color: "#059669" },
      { label: "Low Stock Alerts", value: stats.lowStockMedicines, color: "#991B1B" },
    ];
    // Admin default
    return [
      { label: "Total Registrations", value: stats.totalRegistrations, color: "#2563EB" },
      { label: "Total Consultations", value: stats.totalConsultations, color: "#2563EB" },
      { label: "Total Revenue", value: `₹${stats.totalRevenue || 0}`, color: "#059669" },
      { label: "Pending Revenue", value: `₹${stats.pendingRevenue || 0}`, color: "#92400E" },
    ];
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />

      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Dashboard" breadcrumb="Overview" />

        <main className="flex-1 p-6 space-y-6">
          {/* Page title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="text-[#64748B] text-[13px] mt-1">
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
                className="bg-white rounded-xl border border-[#E2E8F0] p-6 h-full"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)",
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
                        <span className="text-[13px] text-[#64748B]">{item.label}</span>
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
                <div className="mt-6 pt-5 border-t border-[#E2E8F0] grid grid-cols-2 gap-2">
                  <Link
                    href="/registration"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#FFF0F2] text-[#2563EB] text-[12px] font-semibold hover:bg-[#FEE2E2] transition-colors"
                  >
                    + Register
                  </Link>
                  <Link
                    href="/billing"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold hover:border-[rgba(15,23,42,0.2)] hover:text-[#0F172A] transition-colors"
                  >
                    New Bill
                  </Link>
                  <Link
                    href="/pharmacy"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold hover:border-[rgba(15,23,42,0.2)] hover:text-[#0F172A] transition-colors"
                  >
                    Dispense Meds
                  </Link>
                  <Link
                    href="/investigations"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold hover:border-[rgba(15,23,42,0.2)] hover:text-[#0F172A] transition-colors"
                  >
                    Order Test
                  </Link>
                  <Link
                    href="/reports/eod"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold hover:border-[rgba(15,23,42,0.2)] hover:text-[#0F172A] transition-colors col-span-2"
                  >
                    View Full EOD Report
                  </Link>
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
