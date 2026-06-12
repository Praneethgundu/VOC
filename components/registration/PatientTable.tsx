"use client";

import { useEffect, useState } from "react";
import { getPatients, deletePatient } from "@/services/patientService";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Search, RefreshCw, Printer, Edit2, Trash2 } from "lucide-react";
import PatientEditModal from "./PatientEditModal";

export default function PatientTable() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch {
      /* silence */
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (opNumber: string) => {
    if (!confirm(`Are you sure you want to delete patient ${opNumber}?`)) return;
    try {
      await deletePatient(opNumber);
      fetchPatients();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete patient");
    }
  };

  const [editingPatient, setEditingPatient] = useState<any>(null);

  const filtered = patients.filter(
    (p) =>
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.opNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor?.toLowerCase().includes(search.toLowerCase()),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrintOpSlip = (patient: any) => {
    const slipWindow = window.open("", "_blank");
    if (!slipWindow) return;
    slipWindow.document.write(`
      <html>
        <head>
          <title>OP Slip - ${patient.opNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .details { margin-top: 20px; border: 1px solid #ccc; padding: 10px; }
          </style>
        </head>
        <body>
          <h1>Hospital OP Slip</h1>
          <div class="details">
            <p><strong>OP Number:</strong> ${patient.opNumber}</p>
            <p><strong>Patient Name:</strong> ${patient.fullName}</p>
            <p><strong>Age/Gender:</strong> ${patient.age} / ${patient.gender}</p>
            <p><strong>Doctor:</strong> ${patient.doctor}</p>
            <p><strong>Date:</strong> ${new Date(patient.createdAt).toLocaleDateString()}</p>
          </div>
          <script>
            window.print();
            window.onfocus = function () { window.close(); }
          </script>
        </body>
      </html>
    `);
    slipWindow.document.close();
  };

  return (
    <div
      className="bg-white rounded-xl border border-[#E2E8F0] p-6"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-heading">Registered Patients</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
            {patients.length} patients on record
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 h-9">
            <Search size={13} className="text-[#64748B] shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-transparent outline-none text-[13px] text-[#1E293B] placeholder:text-[#64748B] w-36"
            />
          </div>
          <button
            onClick={fetchPatients}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-[#64748B]">
          <RefreshCw size={24} className="animate-spin text-[#2563EB]" />
          <p className="text-[13px]">Loading patients…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] text-[13px]">
          No patients found.
        </div>
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>OP Number</Th>
                <Th>Patient Name</Th>
                <Th>Age / Gender</Th>
                <Th>Phone</Th>
                <Th>Doctor</Th>
                <Th align="center">Blood Group</Th>
                <Th align="right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {paginated.map((patient, i) => (
                <Tr key={patient.id || `${patient.opNumber}-${i}`} index={i}>
                  <Td>
                    <span className="font-mono text-[13px] font-semibold text-[#0F172A]">
                      {patient.opNumber}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#0F172A] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {patient.fullName?.charAt(0) ?? "?"}
                      </div>
                      <span className="font-medium text-[#1E293B]">
                        {patient.fullName}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-[#1E293B]">{patient.age}</span>
                    <span className="text-[#64748B] ml-1 text-[12px]">
                      / {patient.gender}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[13px]">{patient.phone}</span>
                  </Td>
                  <Td>{patient.doctor}</Td>
                  <Td align="center">
                    {patient.bloodGroup && (
                      <Badge status="error">{patient.bloodGroup}</Badge>
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePrintOpSlip(patient)}
                        title="Print OP Slip"
                        className="flex items-center justify-center p-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] hover:border-[rgba(15,23,42,0.2)] hover:text-[#0F172A] transition-colors"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        onClick={() => setEditingPatient(patient)}
                        title="Edit Patient"
                        className="flex items-center justify-center p-1.5 rounded bg-blue-50 border border-blue-100 text-blue-600 hover:border-blue-200 hover:text-blue-800 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.opNumber)}
                        title="Delete Patient"
                        className="flex items-center justify-center p-1.5 rounded bg-red-50 border border-red-100 text-red-600 hover:border-red-200 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-[13px] text-[#64748B]">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </div>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1 border border-[#E2E8F0] rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1 border border-[#E2E8F0] rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {editingPatient && (
        <PatientEditModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={fetchPatients}
        />
      )}
    </div>
  );
}
