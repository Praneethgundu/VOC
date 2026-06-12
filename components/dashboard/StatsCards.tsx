import { Users, Calendar, IndianRupee, Pill, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getPatients } from "@/services/patientService";
import { getBills } from "@/services/billingService";
import { getMedicines } from "@/services/pharmacyService";

export default function StatsCards() {
  const [patientCount, setPatientCount] = useState(0);
  const [todayOP, setTodayOP] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [medCount, setMedCount] = useState(0);

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

      setPatientCount(patients.length);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayPatients = patients.filter((p: any) => p.createdAt?.startsWith(todayStr));
      setTodayOP(todayPatients.length);

      const todayBills = bills.filter((b: any) => b.date?.startsWith(todayStr));
      const totalRev = todayBills.reduce((acc: number, b: any) => acc + (Number(b.total) || 0), 0);
      setRevenue(totalRev);

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
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
        const isUp = item.changeDir === "up";

        return (
          <div
            key={item.title}
            className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
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
  );
}