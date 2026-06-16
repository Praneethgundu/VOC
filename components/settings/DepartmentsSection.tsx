"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Edit2, X, User, Save } from "lucide-react";
import { SettingsSection } from "@/app/(dashboard)/settings/page";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function DepartmentsSection() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptFee, setDeptFee] = useState<number | "">("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setDeptName("");
    setDeptFee("");
    setEditId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setModalMode("edit");
    setDeptName(dept.name);
    setDeptFee(dept.fee);
    setEditId(dept.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success("Department deleted!");
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  const handleSave = async () => {
    if (!deptName.trim()) {
      toast.error("Department name is required");
      return;
    }
    
    try {
      const payload = {
        name: deptName.trim(),
        fee: Number(deptFee) || 0,
      };

      if (modalMode === "add") {
        await api.post("/departments", payload);
        toast.success("Department added!");
      } else {
        await api.put(`/departments/${editId}`, payload);
        toast.success("Department updated!");
      }
      
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save department");
    }
  };

  return (
    <SettingsSection
      icon={User}
      title="Departments"
      subtitle="Manage active departments and standard consultation fees"
    >
      <div className="space-y-2 relative">
        {loading ? (
          <p className="text-sm text-gray-500 py-4 text-center">Loading departments...</p>
        ) : departments.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-xl">No departments configured yet.</p>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E2E8F0] hover:border-[rgba(15,23,42,0.15)] hover:bg-[#F8FAFC] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span className="text-[14px] font-medium text-[#1E293B]">{dept.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-semibold text-[#1E293B]">₹{dept.fee}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(dept)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(dept.id, dept.name)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <button 
          onClick={openAddModal}
          className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-[rgba(15,23,42,0.25)] text-[#0F172A] text-[13px] font-semibold hover:bg-[#F8FAFC] hover:border-blue-500 transition-colors"
        >
          + Add Department
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-[#1E293B]">
                  {modalMode === "add" ? "Add Department" : "Edit Department"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <Input
                  label="Department Name"
                  placeholder="e.g. Orthopaedics"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  autoFocus
                />
                <Input
                  label="Consultation Fee (₹)"
                  placeholder="e.g. 500"
                  type="number"
                  value={deptFee}
                  onChange={(e) => setDeptFee(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <div className="pt-2 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button className="flex-1" icon={<Save size={16}/>} onClick={handleSave}>Save</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
