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

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    newReg: 0,
    consultations: 0,
    labTests: 0,
    pendingBills: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const [patients, consultations, investigations, bills] = await Promise.all([
        getPatients().catch(() => []),
        getConsultations().catch(() => []),
        getInvestigations().catch(() => []),
        getBills().catch(() => []),
      ]);

      const todayPatients = patients.filter((p: any) => p.createdAt?.startsWith(todayStr));
      const todayConsultations = consultations.filter((c: any) => c.consultationDate?.startsWith(todayStr));
      const todayLab = investigations.filter((i: any) => i.orderedDate?.startsWith(todayStr) || i.createdAt?.startsWith(todayStr));
      const todayPendingBills = bills.filter((b: any) => b.status === "Unpaid" && b.date?.startsWith(todayStr));

      setSummary({
        newReg: todayPatients.length,
        consultations: todayConsultations.length,
        labTests: todayLab.length,
        pendingBills: todayPendingBills.length,
      });
    } catch {
      // ignore
    }
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
                  {[
                    { label: "New Registrations", value: summary.newReg.toString(), color: "#E12D45" },
                    { label: "Consultations Done", value: summary.consultations.toString(), color: "#2563EB" },
                    { label: "Lab Tests Ordered", value: summary.labTests.toString(), color: "#F59E0B" },
                    { label: "Pending Bills", value: summary.pendingBills.toString(), color: "#6B7280" },
                  ].map((item) => (
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
                    href="/reports"
                    className="flex items-center justify-center py-2 rounded-lg bg-[#FDF8F8] border border-[#ECECEC] text-[#6B7280] text-[12px] font-semibold hover:border-[rgba(128,0,32,0.2)] hover:text-[#800020] transition-colors col-span-2"
                  >
                    EOD Report
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