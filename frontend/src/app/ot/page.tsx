"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { scheduleProcedure, getProcedures } from "@/services/otService";

export default function OTPage() {
  const [formData, setFormData] = useState({
    patientName: "",
    doctor: "",
    procedure: "",
    date: "",
    time: "",
  });
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const data = await getProcedures();
      setProcedures(data);
    } catch {
      // ignore
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await scheduleProcedure(formData);
      alert("Procedure scheduled");
      setFormData({ patientName: "", doctor: "", procedure: "", date: "", time: "" });
      fetchProcedures();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex bg-[#FDF8F8] min-h-screen">
        <Sidebar />

        <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
          <Navbar pageTitle="OT Procedures" breadcrumb="Clinical" />

          <main className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="page-title">OT Scheduling & Procedures</h1>
                <p className="text-[#6B7280] text-[13px] mt-1">
                  Manage operating theater schedules and track procedures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* OT Scheduling Form */}
              <div className="bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
                <h2 className="section-heading mb-4">Schedule Procedure</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#1A2332] mb-1">Patient Name</label>
                    <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required className="w-full h-9 rounded-lg border border-[#ECECEC] bg-[#FDF8F8] px-3 text-[13px] outline-none focus:border-[#E12D45]" placeholder="Enter patient name" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#1A2332] mb-1">Assigned Doctor</label>
                    <input type="text" name="doctor" value={formData.doctor} onChange={handleChange} required className="w-full h-9 rounded-lg border border-[#ECECEC] bg-[#FDF8F8] px-3 text-[13px] outline-none focus:border-[#E12D45]" placeholder="Select surgeon" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#1A2332] mb-1">Procedure</label>
                    <input type="text" name="procedure" value={formData.procedure} onChange={handleChange} required className="w-full h-9 rounded-lg border border-[#ECECEC] bg-[#FDF8F8] px-3 text-[13px] outline-none focus:border-[#E12D45]" placeholder="e.g. Knee Replacement" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#1A2332] mb-1">Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full h-9 rounded-lg border border-[#ECECEC] bg-[#FDF8F8] px-3 text-[13px] outline-none focus:border-[#E12D45]" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#1A2332] mb-1">Time</label>
                      <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full h-9 rounded-lg border border-[#ECECEC] bg-[#FDF8F8] px-3 text-[13px] outline-none focus:border-[#E12D45]" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-10 mt-2 rounded-lg bg-[#E12D45] text-white text-[13px] font-bold hover:bg-[#C82239] transition-colors disabled:opacity-50">
                    Confirm Schedule
                  </button>
                </form>
              </div>

              {/* Procedure Tracking Table */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#ECECEC] p-6 shadow-sm">
                <h2 className="section-heading mb-4">Procedure Tracking</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#ECECEC]">
                        <th className="pb-3 text-[12px] text-[#6B7280] font-semibold">Date & Time</th>
                        <th className="pb-3 text-[12px] text-[#6B7280] font-semibold">Patient</th>
                        <th className="pb-3 text-[12px] text-[#6B7280] font-semibold">Procedure</th>
                        <th className="pb-3 text-[12px] text-[#6B7280] font-semibold">Doctor</th>
                        <th className="pb-3 text-[12px] text-[#6B7280] font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {procedures.map((p, i) => (
                        <tr key={i} className="border-b border-[#ECECEC]">
                          <td className="py-3 text-[13px] text-[#1A2332] font-medium">{p.date} {p.time}</td>
                          <td className="py-3 text-[13px] text-[#1A2332]">{p.patientName}</td>
                          <td className="py-3 text-[13px] text-[#6B7280]">{p.procedure}</td>
                          <td className="py-3 text-[13px] text-[#6B7280]">{p.doctor}</td>
                          <td className="py-3 text-center">
                            <select
                              value={p.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  const { updateProcedureStatus } = await import("@/services/otService");
                                  await updateProcedureStatus(p.id, newStatus);
                                  fetchProcedures();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-[12px] border border-[#ECECEC] rounded px-2 py-1 bg-[#FDF8F8] text-[#6B7280] font-bold"
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Prep">Prep</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Recovery">Recovery</option>
                              <option value="Discharged">Discharged</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {procedures.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-3 text-center text-[#6B7280] text-[13px]">No procedures scheduled.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
