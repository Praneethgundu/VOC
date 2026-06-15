"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Edit2, X, FileText } from "lucide-react";
import { SettingsSection } from "@/app/(dashboard)/settings/page";

export default function MacrosSection() {
  const [activeTab, setActiveTab] = useState<"dot" | "chip">("dot");
  
  const [dotPhrases, setDotPhrases] = useState<Record<string, string>>({});
  const [smartChips, setSmartChips] = useState<Record<string, { exam: string[], diagnosis: string[] }>>({});
  
  const [loading, setLoading] = useState(true);

  const [editDot, setEditDot] = useState<{ shortcut: string, text: string } | null>(null);
  const [editChip, setEditChip] = useState<{ 
    chiefComplaint: string, 
    examChips: string, 
    diagnosisChips: string 
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDot, resChip] = await Promise.all([
        api.get("/macros/dot-phrases"),
        api.get("/macros/smart-chips")
      ]);
      setDotPhrases(resDot.data);
      setSmartChips(resChip.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDot = async () => {
    if (!editDot?.shortcut || !editDot?.text) return alert("Fill all fields");
    try {
      await api.post("/macros/dot-phrases", editDot);
      setEditDot(null);
      fetchData();
    } catch (e) {
      alert("Failed to save dot phrase");
    }
  };

  const handleDeleteDot = async (shortcut: string) => {
    if (!confirm("Delete this dot phrase?")) return;
    try {
      await api.delete(`/macros/dot-phrases?shortcut=${encodeURIComponent(shortcut)}`);
      fetchData();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const handleSaveChip = async () => {
    if (!editChip?.chiefComplaint) return alert("Chief Complaint required");
    try {
      const payload = {
        chiefComplaint: editChip.chiefComplaint,
        examChips: editChip.examChips.split(",").map(s => s.trim()).filter(Boolean),
        diagnosisChips: editChip.diagnosisChips.split(",").map(s => s.trim()).filter(Boolean)
      };
      await api.post("/macros/smart-chips", payload);
      setEditChip(null);
      fetchData();
    } catch (e) {
      alert("Failed to save smart chip config");
    }
  };

  const handleDeleteChip = async (complaint: string) => {
    if (!confirm("Delete this smart chip config?")) return;
    try {
      await api.delete(`/macros/smart-chips?complaint=${encodeURIComponent(complaint)}`);
      fetchData();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  return (
    <SettingsSection
      icon={FileText}
      title="Clinical Macros & Templates"
      subtitle="Manage your Dot Phrases and Smart Chips for faster clinical charting"
    >
      <div className="flex space-x-1 bg-[#F1F5F9] p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab("dot")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "dot" ? "bg-white text-[#2563EB] shadow-sm" : "text-gray-500 hover:text-[#0F172A]"}`}
        >
          Dot Phrases
        </button>
        <button
          onClick={() => setActiveTab("chip")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "chip" ? "bg-white text-[#2563EB] shadow-sm" : "text-gray-500 hover:text-[#0F172A]"}`}
        >
          Smart Chips
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading macros...</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          {activeTab === "dot" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[13px] text-[#64748B]">Create text shortcuts that auto-expand in Clinical Notes.</p>
                <button 
                  onClick={() => setEditDot({ shortcut: ".", text: "" })}
                  className="flex items-center gap-2 bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1D4ED8]"
                >
                  <Plus size={14} /> Add Phrase
                </button>
              </div>

              {editDot && (
                <div className="mb-6 p-4 border border-[#2563EB]/30 bg-blue-50/50 rounded-lg space-y-4">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-[#0F172A] text-sm">Edit Dot Phrase</h3>
                    <button onClick={() => setEditDot(null)}><X size={16} className="text-gray-500 hover:text-gray-700"/></button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Shortcut</label>
                    <input 
                      type="text" 
                      value={editDot.shortcut} 
                      onChange={e => setEditDot({...editDot, shortcut: e.target.value})}
                      className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB]" 
                      placeholder="e.g. .normalneck"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Expanded Text</label>
                    <textarea 
                      value={editDot.text} 
                      onChange={e => setEditDot({...editDot, text: e.target.value})}
                      className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm h-24 outline-none focus:border-[#2563EB] resize-none" 
                    />
                  </div>
                  <button onClick={handleSaveDot} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#1D4ED8]">Save Phrase</button>
                </div>
              )}

              <div className="divide-y divide-[#E2E8F0]">
                {Object.entries(dotPhrases).map(([shortcut, text]) => (
                  <div key={shortcut} className="py-4 flex items-start justify-between">
                    <div>
                      <code className="text-[#2563EB] bg-[#EFF6FF] px-2 py-1 rounded text-xs font-bold">{shortcut}</code>
                      <p className="mt-2 text-[13px] text-[#475569] whitespace-pre-wrap">{text}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => setEditDot({ shortcut, text })} className="text-gray-400 hover:text-[#2563EB]"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteDot(shortcut)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "chip" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[13px] text-[#64748B]">Bind dynamic suggestion chips to specific Chief Complaints.</p>
                <button 
                  onClick={() => setEditChip({ chiefComplaint: "", examChips: "", diagnosisChips: "" })}
                  className="flex items-center gap-2 bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1D4ED8]"
                >
                  <Plus size={14} /> Add Chips
                </button>
              </div>

              {editChip && (
                <div className="mb-6 p-4 border border-[#2563EB]/30 bg-blue-50/50 rounded-lg space-y-4">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-[#0F172A] text-sm">Edit Smart Chips</h3>
                    <button onClick={() => setEditChip(null)}><X size={16} className="text-gray-500 hover:text-gray-700"/></button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Chief Complaint</label>
                    <input 
                      type="text" 
                      value={editChip.chiefComplaint} 
                      onChange={e => setEditChip({...editChip, chiefComplaint: e.target.value})}
                      placeholder="e.g. Neck Pain"
                      className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Examination Chips (comma separated)</label>
                    <textarea 
                      value={editChip.examChips} 
                      onChange={e => setEditChip({...editChip, examChips: e.target.value})}
                      className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm h-16 outline-none focus:border-[#2563EB] resize-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Diagnosis Chips (comma separated)</label>
                    <textarea 
                      value={editChip.diagnosisChips} 
                      onChange={e => setEditChip({...editChip, diagnosisChips: e.target.value})}
                      className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm h-16 outline-none focus:border-[#2563EB] resize-none" 
                    />
                  </div>
                  <button onClick={handleSaveChip} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#1D4ED8]">Save Chips</button>
                </div>
              )}

              <div className="divide-y divide-[#E2E8F0]">
                {Object.entries(smartChips).map(([complaint, data]) => (
                  <div key={complaint} className="py-4 flex items-start justify-between">
                    <div className="w-full">
                      <h4 className="font-bold text-[#0F172A] mb-3 text-sm">{complaint}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase">Exam Chips</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {data.exam.map(c => (
                              <span key={c} className="text-[10px] font-medium bg-[#F1F5F9] px-2 py-1 rounded text-[#475569]">{c}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase">Diagnosis Chips</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {data.diagnosis.map(c => (
                              <span key={c} className="text-[10px] font-medium bg-[#EFF6FF] px-2 py-1 rounded text-[#2563EB]">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => setEditChip({ 
                          chiefComplaint: complaint, 
                          examChips: data.exam.join(", "), 
                          diagnosisChips: data.diagnosis.join(", ") 
                        })} 
                        className="text-gray-400 hover:text-[#2563EB]"
                      ><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteChip(complaint)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SettingsSection>
  );
}
