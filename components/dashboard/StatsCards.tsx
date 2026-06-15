import { Users, Calendar, IndianRupee, Pill, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPatients } from "@/services/patientService";
import { getBills } from "@/services/billingService";
import { getMedicines } from "@/services/pharmacyService";

export default function StatsCards() {
  const [patientCount, setPatientCount] = useState(0);
  const [todayOP, setTodayOP] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [medCount, setMedCount] = useState(0);

  const [modalType, setModalType] = useState<string | null>(null);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [todayPatients, setTodayPatientsList] = useState<any[]>([]);
  const [todayBills, setTodayBillsList] = useState<any[]>([]);
  const [allMeds, setAllMeds] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patients, bills, meds] = await Promise.all([
        getPatients().catch(() => []),
        getBills().catch(() => []),
        getMedicines().catch(() => [])
      ]);

      setAllPatients(patients);
      setPatientCount(patients.length);

      const todayStr = new Date().toISOString().split("T")[0];
      const todaysP = patients.filter((p: any) => p.createdAt?.startsWith(todayStr));
      setTodayPatientsList(todaysP);
      setTodayOP(todaysP.length);

      const todaysB = bills.filter((b: any) => b.date?.startsWith(todayStr)).map((b: any) => {
        const patient = patients.find((p: any) => p.opNumber === b.opNumber || p.patientId === b.patientId);
        return {
          ...b,
          patientName: patient ? patient.fullName : "Unknown",
        };
      });
      setTodayBillsList(todaysB);
      const totalRev = todaysB.reduce((acc: number, b: any) => acc + (Number(b.total) || 0), 0);
      setRevenue(totalRev);

      setAllMeds(meds);
      setMedCount(meds.length);
    } catch {
      // ignore
    }
  };

  const stats = [
    {
      title: "Total Patients",
      value: patientCount.toString(),
      change: "+0%",
      changeDir: "up",
      icon: Users,
      iconBg: "bg-[#FFF0F2]",
      iconColor: "text-[#2563EB]",
      accentColor: "#2563EB",
      modalId: "patients",
    },
    {
      title: "Today's OP",
      value: todayOP.toString(),
      change: "+0",
      changeDir: "up",
      icon: Calendar,
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#2563EB]",
      accentColor: "#2563EB",
      modalId: "todayOP",
    },
    {
      title: "Revenue Today",
      value: `₹${revenue.toLocaleString("en-IN")}`,
      change: "+0%",
      changeDir: "up",
      icon: IndianRupee,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#059669]",
      accentColor: "#059669",
      modalId: "revenue",
    },
    {
      title: "Medicines",
      value: medCount.toString(),
      change: "-0",
      changeDir: "down",
      icon: Pill,
      iconBg: "bg-[#FFFBEB]",
      iconColor: "text-[#92400E]",
      accentColor: "#92400E",
      modalId: "medicines",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
        const isUp = item.changeDir === "up";

        return (
          <div
            key={item.title}
            onClick={() => setModalType(item.modalId)}
            className="block bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] cursor-pointer hover:border-[#2563EB]"
            style={{
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)",
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}
              >
                <Icon size={20} className={item.iconColor} />
              </div>
              <span
                className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-lg ${
                  isUp
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-[#FFFBEB] text-[#92400E]"
                }`}
              >
                {isUp ? (
                  <TrendingUp size={11} />
                ) : (
                  <TrendingDown size={11} />
                )}
                {item.change}
              </span>
            </div>

            {/* Value */}
            <p className="card-value">{item.value}</p>

            {/* Label */}
            <p className="text-[#64748B] text-[13px] font-medium mt-1">
              {item.title}
            </p>

            {/* Accent bar */}
            <div className="mt-4 h-0.5 rounded-full bg-[#F8FAFC] overflow-hidden">
              <div
                className="h-full rounded-full w-3/4 transition-all duration-500"
                style={{ backgroundColor: item.accentColor, opacity: 0.35 }}
              />
            </div>
          </div>
        );
      })}
    </div>
    
    {modalType && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalType(null)}>
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <h2 className="text-xl font-extrabold text-[#0F172A]">
              {modalType === 'patients' && 'Total Patients'}
              {modalType === 'todayOP' && "Today's OP"}
              {modalType === 'revenue' && 'Revenue Today'}
              {modalType === 'medicines' && 'Medicines'}
            </h2>
            <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>
          </div>
          <div className="p-0 overflow-auto">
            <table className="w-full text-left border-collapse">
              {modalType === 'patients' || modalType === 'todayOP' ? (
                <>
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-[#E2E8F0]">
                      <th className="p-4">OP Number</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(modalType === 'patients' ? allPatients : todayPatients).map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-bold text-[#2563EB]">{p.opNumber}</td>
                        <td className="p-4 text-sm text-[#1E293B]">{p.fullName || p.patientName || "Unknown"}</td>
                        <td className="p-4 text-sm text-gray-500">{p.phoneNumber || p.phone || "-"}</td>
                      </tr>
                    ))}
                    {(modalType === 'patients' ? allPatients : todayPatients).length === 0 && (
                      <tr><td colSpan={3} className="p-8 text-center text-gray-500 font-medium">No records found.</td></tr>
                    )}
                  </tbody>
                </>
              ) : modalType === 'revenue' ? (
                <>
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-[#E2E8F0]">
                      <th className="p-4">Bill No</th>
                      <th className="p-4">Patient</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayBills.map((b, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-bold text-[#2563EB]">{b.id || b._id}</td>
                        <td className="p-4 text-sm text-[#1E293B]">{b.patientName || b.patient || "Unknown"}</td>
                        <td className="p-4 text-sm font-bold text-[#059669]">₹{(b.total || 0).toLocaleString("en-IN")}</td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Paid' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FFFBEB] text-[#92400E]'}`}>
                            {b.status || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {todayBills.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No records found.</td></tr>
                    )}
                  </tbody>
                </>
              ) : modalType === 'medicines' ? (
                <>
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-[#E2E8F0]">
                      <th className="p-4">Medicine Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMeds.map((m, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-bold text-[#1E293B]">{m.medicineName}</td>
                        <td className="p-4 text-sm text-gray-500">{m.category}</td>
                        <td className="p-4 text-sm font-bold text-gray-700 bg-gray-50 w-32 text-center">{m.stock}</td>
                      </tr>
                    ))}
                    {allMeds.length === 0 && (
                      <tr><td colSpan={3} className="p-8 text-center text-gray-500 font-medium">No records found.</td></tr>
                    )}
                  </tbody>
                </>
              ) : null}
            </table>
          </div>
        </div>
      </div>
    )}
    </>
  );
}