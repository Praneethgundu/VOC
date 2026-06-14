"use client";

import {
  ComposedChart,
  Bar,
  Line,
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
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-[13px]">
        <p className="font-bold text-[#1E293B] mb-2">{label}</p>
        <p className="text-[#2563EB] font-semibold flex items-center justify-between gap-4">
          <span>Revenue:</span>
          <span>₹{payload[0]?.value?.toLocaleString("en-IN")}</span>
        </p>
        <p className="text-[#059669] font-medium flex items-center justify-between gap-4 mt-1">
          <span>Patients:</span>
          <span>{payload[1]?.value}</span>
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
      className="bg-white rounded-xl border border-[#E2E8F0] p-6"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-heading">Revenue Overview</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
            Weekly performance summary
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span className="text-[#64748B] font-medium">Revenue</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span className="text-[#64748B] font-medium">Patients</span>
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#64748B", fontFamily: "Plus Jakarta Sans" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: "#64748B", fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: "#64748B", fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="#2563EB"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="patients"
            stroke="#059669"
            strokeWidth={3}
            dot={{ fill: "#059669", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#059669" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}