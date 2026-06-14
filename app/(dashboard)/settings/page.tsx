"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import {
  Building2, User, Bell, Shield, Printer, Save,
  ChevronRight, ToggleLeft, ToggleRight, Database, UploadCloud, Key
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "@/services/api";
import { toast } from "sonner";

/* ── Toggle helper ─────────────────────────────────────────── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ── Section wrapper ───────────────────────────────────────── */
function SettingsSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,23,42,0.04)" }}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F0] bg-[#FDFAFA]">
        <div className="w-9 h-9 rounded-xl bg-[#FFF0F2] flex items-center justify-center">
          <Icon size={16} className="text-[#2563EB]" />
        </div>
        <div>
          <h2 className="section-heading">{title}</h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ── ToggleRow ─────────────────────────────────────────────── */
function ToggleRow({
  label,
  desc,
  enabled,
  onToggle,
}: {
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-b-0">
      <div>
        <p className="text-[14px] font-semibold text-[#1E293B]">{label}</p>
        <p className="text-[12px] text-[#64748B] mt-0.5">{desc}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

const departments = [
  "Orthopaedics",
  "Spine Surgery",
  "Physiotherapy",
  "Sports Medicine",
  "Paediatric Ortho",
  "Hand & Wrist",
];

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const response = await api.get("/backup");
      const data = response.data;

      // Create SheetJS workbook
      const wb = XLSX.utils.book_new();

      for (const [sheetName, rows] of Object.entries(data)) {
        const ws = XLSX.utils.json_to_sheet(rows as any[]);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      // Download file
      XLSX.writeFile(wb, `VOC_Backup_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Database exported successfully!");
    } catch (error: any) {
      console.error("Backup export error:", error);
      toast.error(error.response?.data?.message || "Failed to export backup");
    } finally {
      setExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      "Are you absolutely sure you want to restore the database? This will completely overwrite all current records!"
    );
    if (!confirmRestore) {
      e.target.value = ""; // Clear input
      return;
    }

    setRestoring(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const binaryStr = evt.target?.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const payload: Record<string, any[]> = {};

          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            payload[sheetName] = XLSX.utils.sheet_to_json(worksheet);
          });

          // Send restore payload to backend
          await api.post("/backup/restore", payload);
          toast.success("Database restored successfully! Reloading page...");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (err: any) {
          console.error("Excel parse/restore error:", err);
          toast.error(err.response?.data?.message || "Failed to process restore file");
          setRestoring(false);
        }
      };
      reader.onerror = () => {
        toast.error("Error reading file");
        setRestoring(false);
      };
      reader.readAsBinaryString(file);
    } catch (error: any) {
      toast.error("Failed to restore backup");
      setRestoring(false);
    }
  };

  const [hospital, setHospital] = useState({
    name: "VOC Orthopaedic Hospital",
    phone: "+91 98765 43210",
    email: "info@vocortho.com",
    address: "123 Main Road, Chennai, TN 600001",
    registration: "MCI/TN/2018/001",
    currency: "INR",
    regFormat: "OP/YYYY/###",
  });

  const [toggles, setToggles] = useState({
    smsNotifications: true,
    emailAlerts: false,
    printReceipt: true,
    autoBackup: true,
    darkMode: false,
    labIntegration: false,
  });

  const [resetRequests, setResetRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchResetRequests();
  }, []);

  const fetchResetRequests = async () => {
    try {
      const res = await api.get("/auth/reset-requests");
      setResetRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch reset requests", error);
    }
  };

  const generatePin = async (userId: string) => {
    try {
      const res = await api.post("/auth/generate-reset-pin", { userId });
      if (res.data.success) {
        toast.success(`Generated PIN: ${res.data.pin}`, { duration: 10000 });
        fetchResetRequests();
      }
    } catch (error) {
      toast.error("Failed to generate PIN");
    }
  };

  const toggle = (key: keyof typeof toggles) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleHospitalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setHospital({ ...hospital, [e.target.name]: e.target.value });

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Settings" breadcrumb="Configuration" />
        <main className="flex-1 p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="text-[#64748B] text-[13px] mt-1">
                Configure hospital profile, notifications, and system preferences
              </p>
            </div>
            <Button icon={<Save size={15} />} size="md">Save Changes</Button>
          </div>

          {/* Hospital Profile */}
          <SettingsSection
            icon={Building2}
            title="Hospital Profile"
            subtitle="Update your hospital name, contact, and registration info"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Hospital Name"
                name="name"
                value={hospital.name}
                onChange={handleHospitalChange}
              />
              <Input
                label="Phone Number"
                name="phone"
                value={hospital.phone}
                onChange={handleHospitalChange}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={hospital.email}
                onChange={handleHospitalChange}
              />
              <Input
                label="Registration Number"
                name="registration"
                value={hospital.registration}
                onChange={handleHospitalChange}
              />
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  name="address"
                  value={hospital.address}
                  onChange={handleHospitalChange}
                />
              </div>
              <Select
                label="Currency"
                name="currency"
                value={hospital.currency}
                onChange={handleHospitalChange as any}
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
              </Select>
              <Input
                label="OP Number Format"
                name="regFormat"
                value={hospital.regFormat}
                onChange={handleHospitalChange}
                hint="Use YYYY for year, ### for sequence number"
              />
            </div>
          </SettingsSection>

          {/* Departments */}
          <SettingsSection
            icon={User}
            title="Departments"
            subtitle="Manage active departments and consultation fees"
          >
            <div className="space-y-2">
              {departments.map((dept) => (
                <div
                  key={dept}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E2E8F0] hover:border-[rgba(15,23,42,0.15)] hover:bg-[#F8FAFC] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span className="text-[14px] font-medium text-[#1E293B]">{dept}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#64748B]">Fee: ₹500</span>
                    <ChevronRight
                      size={14}
                      className="text-[#64748B] group-hover:text-[#2563EB] transition-colors"
                    />
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-[rgba(15,23,42,0.25)] text-[#0F172A] text-[13px] font-semibold hover:bg-[#FFF0F2] transition-colors">
                + Add Department
              </button>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            icon={Bell}
            title="Notifications"
            subtitle="Control how the system notifies you and patients"
          >
            <ToggleRow
              label="SMS Notifications"
              desc="Send appointment and billing SMS to patients"
              enabled={toggles.smsNotifications}
              onToggle={() => toggle("smsNotifications")}
            />
            <ToggleRow
              label="Email Alerts"
              desc="Send daily summary reports to admin email"
              enabled={toggles.emailAlerts}
              onToggle={() => toggle("emailAlerts")}
            />
            <ToggleRow
              label="Auto-print Receipts"
              desc="Automatically print billing receipts on payment"
              enabled={toggles.printReceipt}
              onToggle={() => toggle("printReceipt")}
            />
          </SettingsSection>

          {/* Password Reset Requests */}
          <SettingsSection
            icon={Key}
            title="Password Reset Requests"
            subtitle="Manage staff password resets"
          >
            {resetRequests.length === 0 ? (
              <p className="text-[13px] text-[#64748B] px-4 py-2">No pending reset requests.</p>
            ) : (
              <div className="space-y-3">
                {resetRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E2E8F0] hover:border-[rgba(15,23,42,0.15)] bg-[#F8FAFC]">
                    <div>
                      <p className="text-[14px] font-bold text-[#1E293B]">{req.username}</p>
                      <p className="text-[12px] text-[#64748B]">Role: {req.role}</p>
                    </div>
                    <Button onClick={() => generatePin(req.id)} size="sm">
                      Generate PIN
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SettingsSection>

          {/* Database Backup & Restore */}
          <SettingsSection
            icon={Database}
            title="Database Backup & Restore"
            subtitle="Download complete database backups as Excel files and restore database state"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="max-w-[400px]">
                <p className="text-[14px] font-semibold text-[#1E293B]">Export Database</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">
                  Generate and download a multi-sheet Microsoft Excel workbook containing all patients, consultations, billing, inventory, and logs.
                </p>
                <div className="mt-3">
                  <Button
                    onClick={handleExportBackup}
                    disabled={exporting}
                    variant="outline"
                  >
                    {exporting ? "Generating..." : "Download Excel Backup"}
                  </Button>
                </div>
              </div>

              <div className="w-[1px] h-24 bg-[#E2E8F0] hidden md:block" />

              <div className="max-w-[400px]">
                <p className="text-[14px] font-semibold text-[#1E293B]">Restore Database</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">
                  Upload a previously exported VOC HMS Excel backup file to restore all records. <span className="text-[#2563EB] font-semibold">Warning: This will overwrite all current database tables!</span>
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="file"
                    id="restore-upload"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={handleImportBackup}
                    disabled={restoring}
                  />
                  <Button
                    onClick={() => document.getElementById("restore-upload")?.click()}
                    disabled={restoring}
                    icon={<UploadCloud size={15} />}
                  >
                    {restoring ? "Restoring..." : "Upload & Restore"}
                  </Button>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Save row */}
          <div className="flex justify-end gap-3 pb-4">
            <Button variant="outline" size="lg">Reset to Defaults</Button>
            <Button size="lg" icon={<Save size={15} />}>Save All Changes</Button>
          </div>

        </main>
      </div>
    </div>
  );
}
