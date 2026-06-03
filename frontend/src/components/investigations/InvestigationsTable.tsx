"use client";

import { useEffect, useState } from "react";
import { getInvestigations } from "@/services/investigationService";
import { Table, THead, TBody, Th, Tr, Td, Badge } from "@/components/ui/Table";
import { Search, Edit, FileText, RefreshCw } from "lucide-react";

export default function InvestigationsTable() {
  const [search, setSearch] = useState("");
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedInv, setSelectedInv] = useState<any>(null);
  const [resultText, setResultText] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const fetchInvestigations = async () => {
    setLoading(true);
    try {
      const data = await getInvestigations();
      setInvestigations(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedInv) return;
    try {
      const { updateInvestigation } = await import("@/services/investigationService");
      await updateInvestigation(selectedInv.id, { status, result: resultText });
      setSelectedInv(null);
      fetchInvestigations();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = investigations.filter(
    (inv) =>
      inv.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.opNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="bg-white rounded-xl border border-[#ECECEC] p-6 mt-6"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-heading">Test Status Tracking</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">Track ordered investigations and enter results</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#FDF8F8] border border-[#ECECEC] rounded-lg px-3 h-9">
            <Search size={13} className="text-[#6B7280] shrink-0" />
            <input
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-[13px] text-[#1A2332] placeholder:text-[#9CA3AF] w-48"
            />
          </div>
          <button onClick={fetchInvestigations} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#ECECEC] text-[#6B7280] hover:border-[#E12D45] hover:text-[#E12D45] transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <Table>
        <THead>
          <tr>
            <Th>Date</Th>
            <Th>OP Number</Th>
            <Th>Patient Name</Th>
            <Th>Test Name</Th>
            <Th>Doctor</Th>
            <Th align="center">Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </THead>
        <TBody>
          {loading ? (
            <Tr index={0}>
              <Td colSpan={7} align="center">
                <div className="py-8 text-[#6B7280] text-[13px]">Loading...</div>
              </Td>
            </Tr>
          ) : filtered.map((inv, i) => (
            <Tr key={inv.id || i} index={i}>
              <Td>{inv.date || new Date(inv.createdAt || inv.orderedDate).toLocaleDateString()}</Td>
              <Td>
                <span className="font-mono text-[13px] font-semibold text-[#800020]">
                  {inv.opNumber}
                </span>
              </Td>
              <Td className="font-medium text-[#1A2332]">{inv.patientName}</Td>
              <Td>{inv.testName}</Td>
              <Td>{inv.doctor}</Td>
              <Td align="center">
                <Badge status={inv.status === "Completed" ? "success" : "warning"}>
                  {inv.status}
                </Badge>
              </Td>
              <Td align="right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedInv(inv);
                      setResultText(inv.result || "");
                      setStatus(inv.status || "Completed");
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#FDF8F8] border border-[#ECECEC] text-[#2563EB] text-[11px] font-semibold hover:border-blue-200 hover:text-blue-700 transition-colors"
                  >
                    <Edit size={12} />
                    Result Entry
                  </button>
                  {inv.result && (
                    <button
                      onClick={() => alert(`Result for ${inv.testName}:\n${inv.result}`)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#FFF0F2] border border-[#FFE0E4] text-[#E12D45] text-[11px] font-semibold hover:bg-[#FFE0E4] transition-colors"
                    >
                      <FileText size={12} />
                      View Result
                    </button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
          {filtered.length === 0 && (
            <Tr index={0}>
              <Td colSpan={7} align="center">
                <div className="py-8 text-[#6B7280] text-[13px]">
                  No investigations found.
                </div>
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>

      {selectedInv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px]">
            <h3 className="text-lg font-semibold mb-4 text-[#1A2332]">Result Entry</h3>
            <div className="mb-4 text-sm">
              <p><strong>Patient:</strong> {selectedInv.patientName}</p>
              <p><strong>Test:</strong> {selectedInv.testName}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2332] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Sample Collected">Sample Collected</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1A2332] mb-1">Result Notes</label>
                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  className="w-full border border-[#ECECEC] rounded p-2 text-sm h-32"
                  placeholder="Enter lab results..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedInv(null)}
                className="px-4 py-2 text-sm text-[#6B7280] bg-[#F9FAFB] rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-sm text-white bg-[#E12D45] rounded hover:bg-[#800020]"
              >
                Save Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
