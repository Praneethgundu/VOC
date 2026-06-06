import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { useEffect, useState } from "react";
import { getPatients } from "@/services/patientService";

export default function RecentPatients() {
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      const data = await getPatients();
      // Get today's patients and take top 5
      const todayStr = new Date().toISOString().split("T")[0];
      const todayPatients = data.filter((p: any) => p.createdAt?.startsWith(todayStr)).slice(0, 5);
      setPatients(todayPatients);
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-heading">Recent Registrations</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            Today&apos;s patient activity
          </p>
        </div>
        <a
          href="/registration"
          className="text-[12px] text-[#E12D45] font-semibold hover:underline"
        >
          View all →
        </a>
      </div>

      <Table>
        <THead>
          <tr>
            <Th>OP Number</Th>
            <Th>Patient Name</Th>
            <Th>Doctor</Th>
            <Th>Department</Th>
            <Th>Complaint</Th>
            <Th align="center">Status</Th>
          </tr>
        </THead>
        <TBody>
          {patients.map((p, i) => (
            <Tr key={p.opNumber || i} index={i}>
              <Td>
                <span className="font-mono text-[13px] font-semibold text-[#800020]">
                  {p.opNumber}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E12D45] to-[#800020] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                    {p.fullName?.charAt(0) ?? "?"}
                  </div>
                  <span className="font-medium text-[#1A2332]">{p.fullName}</span>
                </div>
              </Td>
              <Td>{p.doctor}</Td>
              <Td>
                <span className="px-2 py-0.5 bg-[#FDF8F8] border border-[rgba(128,0,32,0.1)] text-[#800020] text-[11px] font-semibold rounded-md">
                  {p.department || "General"}
                </span>
              </Td>
              <Td>
                <span className="text-[12px] text-gray-600 font-medium">
                  {p.complaint || "N/A"}
                </span>
              </Td>
              <Td align="center">
                <Badge status="success">Completed</Badge>
              </Td>
            </Tr>
          ))}
          {patients.length === 0 && (
            <Tr index={0}>
              <Td colSpan={6} align="center">
                <div className="py-8 text-[#6B7280] text-[13px]">No recent patients.</div>
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>
    </div>
  );
}