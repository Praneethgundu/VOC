"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useState } from "react";
import {
  Building2, User, Bell, Shield, Printer, Save,
  ChevronRight, ToggleLeft, ToggleRight,
} from "lucide-react";

/* ── Toggle helper ─────────────────────────────────────────── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-[#E12D45]" : "bg-[#D1D5DB]"
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
      className="bg-white rounded-xl border border-[#ECECEC] overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)" }}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ECECEC] bg-[#FDFAFA]">
        <div className="w-9 h-9 rounded-xl bg-[#FFF0F2] flex items-center justify-center">
          <Icon size={16} className="text-[#E12D45]" />
        </div>
        <div>
          <h2 className="section-heading">{title}</h2>
          <p className="text-[11px] text-[#6B7280] mt-0.5">{subtitle}</p>
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
    <div className="flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-b-0">
      <div>
        <p className="text-[14px] font-semibold text-[#1A2332]">{label}</p>
        <p className="text-[12px] text-[#6B7280] mt-0.5">{desc}</p>
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

  const toggle = (key: keyof typeof toggles) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleHospitalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setHospital({ ...hospital, [e.target.name]: e.target.value });

  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Settings" breadcrumb="Configuration" />
        <main className="flex-1 p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="text-[#6B7280] text-[13px] mt-1">
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
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#ECECEC] hover:border-[rgba(128,0,32,0.15)] hover:bg-[#FDF8F8] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#E12D45]" />
                    <span className="text-[14px] font-medium text-[#1A2332]">{dept}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#6B7280]">Fee: ₹500</span>
                    <ChevronRight
                      size={14}
                      className="text-[#6B7280] group-hover:text-[#E12D45] transition-colors"
                    />
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-[rgba(128,0,32,0.25)] text-[#800020] text-[13px] font-semibold hover:bg-[#FFF0F2] transition-colors">
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

          {/* System */}
          <SettingsSection
            icon={Shield}
            title="System Preferences"
            subtitle="Control backups, integrations, and display preferences"
          >
            <ToggleRow
              label="Automatic Backup"
              desc="Back up data to server every 24 hours"
              enabled={toggles.autoBackup}
              onToggle={() => toggle("autoBackup")}
            />
            <ToggleRow
              label="Lab Integration"
              desc="Connect with external laboratory information system"
              enabled={toggles.labIntegration}
              onToggle={() => toggle("labIntegration")}
            />
            <ToggleRow
              label="Dark Mode"
              desc="Switch the application to dark theme (coming soon)"
              enabled={toggles.darkMode}
              onToggle={() => toggle("darkMode")}
            />
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
