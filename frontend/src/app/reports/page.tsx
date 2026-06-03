"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Printer, Users, Calendar, IndianRupee, Pill, Microscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useEffect, useState } from "react";
import { getPatients } from "@/services/patientService";
import { getConsultations } from "@/services/consultationService";
import { getBills } from "@/services/billingService";
import { getInvestigations } from "@/services/investigationService";
import { getMedicines } from "@/services/pharmacyService";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#ECECEC] rounded-xl p-3 shadow-lg text-[13px]">
        <p className="font-bold text-[#1A2332] mb-1">{label}</p>
        <p className="text-[#E12D45] font-semibold">₹{(payload[0]?.value / 1000).toFixed(0)}k</p>
        <p className="text-[#2563EB] font-medium">{payload[1]?.value} patients</p>
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  const [eodStats, setEodStats] = useState([
    { label: "New Patients", value: "0", icon: Users, color: "#E12D45", bg: "#FFF0F2" },
    { label: "OP Consultations", value: "0", icon: Calendar, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Total Revenue", value: "₹0", icon: IndianRupee, color: "#16A34A", bg: "#F0FDF4" },
    { label: "Prescriptions", value: "0", icon: Pill, color: "#D97706", bg: "#FFFBEB" },
    { label: "Lab Orders", value: "0", icon: Microscope, color: "#7C3AED", bg: "#F5F3FF" },
  ]);

  const [monthlyData, setMonthlyData] = useState([
    { month: "Jan", revenue: 420000, patients: 310 },
    { month: "Feb", revenue: 380000, patients: 280 },
    { month: "Mar", revenue: 510000, patients: 390 },
    { month: "Apr", revenue: 460000, patients: 345 },
    { month: "May", revenue: 530000, patients: 412 },
  ]);

  const [recentEOD, setRecentEOD] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Daily Reports");
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [allBills, setAllBills] = useState<any[]>([]);
  const [allInventory, setAllInventory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patients, consultations, bills, investigations, medicines] = await Promise.all([
        getPatients().catch(() => []),
        getConsultations().catch(() => []),
        getBills().catch(() => []),
        getInvestigations().catch(() => []),
        getMedicines().catch(() => []),
      ]);

      setAllPatients(patients);
      setAllBills(bills);
      setAllInventory(medicines);

      const todayStr = new Date().toISOString().split("T")[0];

      const newPatients = patients.filter((p: any) => p.createdAt?.startsWith(todayStr)).length;
      const ops = consultations.filter((c: any) => c.consultationDate?.startsWith(todayStr)).length;
      const todayBills = bills.filter((b: any) => b.date?.startsWith(todayStr));
      const totalRev = todayBills.reduce((acc: number, b: any) => acc + (Number(b.total) || 0), 0);
      const prescriptions = consultations.filter((c: any) => c.prescription && c.consultationDate?.startsWith(todayStr)).length;
      const labs = investigations.filter((i: any) => i.createdAt?.startsWith(todayStr) || i.orderedDate?.startsWith(todayStr)).length;

      setEodStats([
        { label: "New Patients", value: newPatients.toString(), icon: Users, color: "#E12D45", bg: "#FFF0F2" },
        { label: "OP Consultations", value: ops.toString(), icon: Calendar, color: "#2563EB", bg: "#EFF6FF" },
        { label: "Total Revenue", value: `₹${totalRev.toLocaleString("en-IN")}`, icon: IndianRupee, color: "#16A34A", bg: "#F0FDF4" },
        { label: "Prescriptions", value: prescriptions.toString(), icon: Pill, color: "#D97706", bg: "#FFFBEB" },
        { label: "Lab Orders", value: labs.toString(), icon: Microscope, color: "#7C3AED", bg: "#F5F3FF" },
      ]);

      const history = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        const pCount = patients.filter((p: any) => p.createdAt?.startsWith(dateStr)).length;
        const bList = bills.filter((b: any) => b.date?.startsWith(dateStr));
        const rev = bList.reduce((acc: number, b: any) => acc + (Number(b.total) || 0), 0);
        const labRev = bList.reduce((acc: number, b: any) => acc + (Number(b.lab) || 0), 0);
        const pharmRev = bList.reduce((acc: number, b: any) => acc + (Number(b.pharmacy) || 0), 0);

        history.push({
          date: dateStr,
          patients: pCount,
          revenue: `₹${rev.toLocaleString("en-IN")}`,
          lab: `₹${labRev.toLocaleString("en-IN")}`,
          pharmacy: `₹${pharmRev.toLocaleString("en-IN")}`,
          status: "Final",
        });
      }
      setRecentEOD(history);

    } catch {
      // ignore
    }
  };

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Reports" breadcrumb="Analytics" />
        <main className="flex-1 p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Reports & Analytics</h1>
              <p className="text-[#6B7280] text-[13px] mt-1">End-of-day summaries and monthly performance</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="md" icon={<Printer size={15} />}>Print</Button>
              <Button size="md" icon={<Download size={15} />}>Export</Button>
            </div>
          </div>

          {/* Report Segments */}
          <div className="flex gap-2 border-b border-[#ECECEC] mt-2 mb-6">
            {["Daily Reports", "Revenue Reports", "Patient Reports", "Inventory Reports"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 font-semibold text-[13px] ${
                  activeTab === tab
                    ? "border-[#E12D45] text-[#E12D45]"
                    : "border-transparent text-[#6B7280] hover:text-[#1A2332]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Daily Reports" && (
            <>
          <div
            className="bg-white rounded-xl border border-[#ECECEC] p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <FileText size={16} className="text-[#800020]" />
              <h2 className="section-heading">Today&apos;s Summary — {new Date().toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric'})}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {eodStats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex flex-col gap-3 p-4 rounded-xl border border-[#ECECEC]">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                      <Icon size={16} style={{ color: s.color }} />
                    </div>
                    <div>
                      <p className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly chart + EOD table */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Chart */}
            <div
              className="xl:col-span-3 bg-white rounded-xl border border-[#ECECEC] p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
            >
              <h2 className="section-heading mb-5">Monthly Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6B7280", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#E12D45" radius={[6, 6, 0, 0]} maxBarSize={40} fillOpacity={0.85} />
                  <Bar dataKey="patients" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={40} fillOpacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick stats */}
            <div
              className="xl:col-span-2 bg-white rounded-xl border border-[#ECECEC] p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
            >
              <h2 className="section-heading mb-5">This Month at a Glance</h2>
              <div className="space-y-4">
                {[
                  { label: "Total Patients", value: "412", pct: "82%" },
                  { label: "Revenue", value: "₹5.3L", pct: "67%" },
                  { label: "Lab Revenue", value: "₹68,400", pct: "54%" },
                  { label: "Pharmacy Sales", value: "₹41,200", pct: "45%" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="text-[#6B7280]">{item.label}</span>
                      <span className="font-bold text-[#1A2332]">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E12D45] rounded-full transition-all duration-700" style={{ width: item.pct, opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EOD history table */}
          <div
            className="bg-white rounded-xl border border-[#ECECEC] p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
          >
            <h2 className="section-heading mb-5">End-of-Day History</h2>
            <Table>
              <THead>
                <tr>
                  <Th>Date</Th>
                  <Th align="center">Patients</Th>
                  <Th align="right">Total Revenue</Th>
                  <Th align="right">Lab</Th>
                  <Th align="right">Pharmacy</Th>
                  <Th align="center">Status</Th>
                </tr>
              </THead>
              <TBody>
                {recentEOD.map((row, i) => (
                  <Tr key={row.date} index={i}>
                    <Td><span className="font-mono text-[13px] font-semibold text-[#800020]">{row.date}</span></Td>
                    <Td align="center"><span className="font-mono font-bold">{row.patients}</span></Td>
                    <Td align="right"><span className="font-mono font-bold text-[#16A34A]">{row.revenue}</span></Td>
                    <Td align="right"><span className="font-mono text-[#2563EB]">{row.lab}</span></Td>
                    <Td align="right"><span className="font-mono text-[#D97706]">{row.pharmacy}</span></Td>
                    <Td align="center"><Badge status="success">{row.status}</Badge></Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
            </>
          )}

          {activeTab === "Patient Reports" && (
            <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
              <h2 className="section-heading mb-4">Patient Registrations ({allPatients.length})</h2>
              <Table>
                <THead>
                  <tr>
                    <Th>OP Number</Th>
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Department</Th>
                    <Th>Date</Th>
                  </tr>
                </THead>
                <TBody>
                  {allPatients.map((p, i) => (
                    <Tr key={i} index={i}>
                      <Td><span className="font-mono text-[#800020] font-bold">{p.opNumber}</span></Td>
                      <Td>{p.fullName}</Td>
                      <Td>{p.phone}</Td>
                      <Td>{p.department}</Td>
                      <Td>{new Date(p.createdAt).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </div>
          )}

          {activeTab === "Revenue Reports" && (
            <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
              <h2 className="section-heading mb-4">All Revenue Transactions ({allBills.length})</h2>
              <Table>
                <THead>
                  <tr>
                    <Th>Bill ID</Th>
                    <Th>Patient</Th>
                    <Th>Date</Th>
                    <Th align="right">Amount</Th>
                    <Th align="center">Status</Th>
                  </tr>
                </THead>
                <TBody>
                  {allBills.map((b, i) => (
                    <Tr key={i} index={i}>
                      <Td><span className="font-mono text-[#800020] font-bold">{b.id}</span></Td>
                      <Td>{b.patientName}</Td>
                      <Td>{new Date(b.date).toLocaleDateString()}</Td>
                      <Td align="right"><span className="font-mono text-[#16A34A] font-bold">₹{b.total}</span></Td>
                      <Td align="center"><Badge status={b.status === "Paid" ? "success" : "error"}>{b.status}</Badge></Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </div>
          )}

          {activeTab === "Inventory Reports" && (
            <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
              <h2 className="section-heading mb-4">Inventory Status ({allInventory.length})</h2>
              <Table>
                <THead>
                  <tr>
                    <Th>Medicine ID</Th>
                    <Th>Name</Th>
                    <Th>Category</Th>
                    <Th align="center">Quantity</Th>
                  </tr>
                </THead>
                <TBody>
                  {allInventory.map((m, i) => (
                    <Tr key={i} index={i}>
                      <Td><span className="font-mono text-[#800020] font-bold">{m.medicineId}</span></Td>
                      <Td>{m.medicineName}</Td>
                      <Td>{m.category}</Td>
                      <Td align="center">
                        <span className={`font-mono font-bold ${Number(m.quantity) < 20 ? "text-red-600" : ""}`}>
                          {m.quantity}
                        </span>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
