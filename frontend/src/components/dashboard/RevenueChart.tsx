"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { getPatients } from "@/services/patientService";
import { getBills } from "@/services/billingService";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#ECECEC] rounded-xl p-3 shadow-lg text-[13px]">
        <p className="font-bold text-[#1A2332] mb-1">{label}</p>
        <p className="text-[#E12D45] font-semibold">
          ₹{payload[0]?.value?.toLocaleString("en-IN")}
        </p>
        <p className="text-[#2563EB] font-medium mt-0.5">
          {payload[1]?.value} patients
        </p>
      </div>
    );
  }
  return null;
}

export default function RevenueChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patients, bills] = await Promise.all([
        getPatients().catch(() => []),
        getBills().catch(() => [])
      ]);

      const chartData = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        
        const pCount = patients.filter((p: any) => p.createdAt?.startsWith(dateStr)).length;
        const bList = bills.filter((b: any) => b.date?.startsWith(dateStr));
        const rev = bList.reduce((acc: number, b: any) => acc + (Number(b.total) || 0), 0);
        
        chartData.push({
          day: days[d.getDay()],
          revenue: rev,
          patients: pCount,
        });
      }
      
      setData(chartData);
    } catch {
      // ignore
    }
  };
  return (
    <div
      className="bg-white rounded-xl border border-[#ECECEC] p-6"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-heading">Revenue Overview</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            Weekly performance summary
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E12D45]" />
            <span className="text-[#6B7280] font-medium">Revenue</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span className="text-[#6B7280] font-medium">Patients</span>
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E12D45" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#E12D45" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="patientsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "Plus Jakarta Sans" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6B7280", fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#E12D45"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
            dot={{ fill: "#E12D45", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#E12D45" }}
          />
          <Area
            type="monotone"
            dataKey="patients"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#patientsGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#2563EB" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}