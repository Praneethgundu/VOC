"use client";

import { useState, useEffect, useRef } from "react";
import { SettingsSection } from "@/app/(dashboard)/settings/page";
import { Printer, Upload, Eye, EyeOff, Save, X, Image as ImageIcon } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

interface PrintHeader {
  logoUrl: string;
  clinicName: string;
  tagline: string;
  doctorName: string;
  credentials: string;
  specialization: string;
}

interface PrintFooter {
  footerUrl: string;
}

interface BillingHeader {
  logoUrl: string;
}

const defaultHeader: PrintHeader = {
  logoUrl: "",
  clinicName: "",
  tagline: "",
  doctorName: "",
  credentials: "",
  specialization: "",
};

const defaultFooter: PrintFooter = {
  footerUrl: "",
};

const defaultBillingHeader: BillingHeader = {
  logoUrl: "",
};

export default function PrintHeaderFooterSection() {
  const [header, setHeader] = useState<PrintHeader>(defaultHeader);
  const [footer, setFooter] = useState<PrintFooter>(defaultFooter);
  const [billingHeader, setBillingHeader] = useState<BillingHeader>(defaultBillingHeader);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFooter, setUploadingFooter] = useState(false);
  const [uploadingBillingLogo, setUploadingBillingLogo] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [footerPreview, setFooterPreview] = useState<string>("");
  const [billingLogoPreview, setBillingLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const footerFileInputRef = useRef<HTMLInputElement>(null);
  const billingFileInputRef = useRef<HTMLInputElement>(null);

  // Load existing settings on mount
  useEffect(() => {
    api.get("/settings").then((res) => {
      const data = res.data;
      if (data.printHeader) {
        try {
          const parsed = JSON.parse(data.printHeader);
          setHeader({ ...defaultHeader, ...parsed });
          if (parsed.logoUrl) {
            const url = parsed.logoUrl.startsWith('/images/') ? parsed.logoUrl.replace('/images/', '/api/images/') : parsed.logoUrl;
            setLogoPreview(url);
          }
        } catch {}
      }
      if (data.printFooter) {
        try {
          const parsed = JSON.parse(data.printFooter);
          setFooter({ ...defaultFooter, ...parsed });
          if (parsed.footerUrl) {
            const url = parsed.footerUrl.startsWith('/images/') ? parsed.footerUrl.replace('/images/', '/api/images/') : parsed.footerUrl;
            setFooterPreview(url);
          }
        } catch {}
      }
      if (data.billingHeader) {
        try {
          const parsed = JSON.parse(data.billingHeader);
          setBillingHeader({ ...defaultBillingHeader, ...parsed });
          if (parsed.logoUrl) {
            const url = parsed.logoUrl.startsWith('/images/') ? parsed.logoUrl.replace('/images/', '/api/images/') : parsed.logoUrl;
            setBillingLogoPreview(url);
          }
        } catch {}
      }
    }).catch(console.error);
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/settings/upload-logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setHeader((prev) => ({ ...prev, logoUrl: data.url }));
      toast.success("Logo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo");
      setLogoPreview(header.logoUrl); // revert preview
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setHeader((prev) => ({ ...prev, logoUrl: "" }));
    setLogoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFooterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setFooterPreview(objectUrl);

    setUploadingFooter(true);
    try {
      const formData = new FormData();
      formData.append("footer", file);
      const res = await fetch("/api/settings/upload-footer", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFooter((prev) => ({ ...prev, footerUrl: data.url }));
      toast.success("Footer image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload footer");
      setFooterPreview(footer.footerUrl);
    } finally {
      setUploadingFooter(false);
      if (footerFileInputRef.current) footerFileInputRef.current.value = "";
    }
  };

  const handleRemoveFooter = () => {
    setFooter((prev) => ({ ...prev, footerUrl: "" }));
    setFooterPreview("");
    if (footerFileInputRef.current) footerFileInputRef.current.value = "";
  };

  const handleBillingLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setBillingLogoPreview(objectUrl);

    setUploadingBillingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file); // can reuse upload-logo endpoint
      const res = await fetch("/api/settings/upload-logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setBillingHeader((prev) => ({ ...prev, logoUrl: data.url }));
      toast.success("Billing logo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload billing logo");
      setBillingLogoPreview(billingHeader.logoUrl);
    } finally {
      setUploadingBillingLogo(false);
      if (billingFileInputRef.current) billingFileInputRef.current.value = "";
    }
  };

  const handleRemoveBillingLogo = () => {
    setBillingHeader((prev) => ({ ...prev, logoUrl: "" }));
    setBillingLogoPreview("");
    if (billingFileInputRef.current) billingFileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.post("/settings", { key: "printHeader", value: JSON.stringify(header) }),
        api.post("/settings", { key: "printFooter", value: JSON.stringify(footer) }),
        api.post("/settings", { key: "billingHeader", value: JSON.stringify(billingHeader) }),
      ]);
      toast.success("Print header & footer saved! Changes will reflect on all new prints.");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const hasHeaderContent = header.clinicName || header.doctorName || header.logoUrl;
  const hasFooterContent = !!footer.footerUrl;

  return (
    <SettingsSection
      icon={Printer}
      title="Print Header & Footer"
      subtitle="Configure the clinic branding that appears on every printed consultation form"
    >
      <div className="space-y-6">

        {/* ── Header Config ─────────────────────────────── */}
        <div>
          <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
            Header Configuration
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Left Column — Clinic Branding */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Clinic Branding (Left)</p>

              {/* Logo Upload */}
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Clinic Logo
                </label>
                <div className="flex items-center gap-3">
                  {/* Preview box */}
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center bg-[#F8FAFC] overflow-hidden flex-shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-[#CBD5E1]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-lg hover:bg-[#DBEAFE] transition-colors disabled:opacity-50"
                    >
                      <Upload size={13} />
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X size={12} /> Remove
                      </button>
                    )}
                    <p className="text-[10px] text-[#94A3B8]">PNG, JPG, SVG or WEBP. Max 5 MB.</p>
                  </div>
                </div>
              </div>

              {/* Clinic Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Clinic / Hospital Name</label>
                <input
                  type="text"
                  value={header.clinicName}
                  onChange={(e) => setHeader((p) => ({ ...p, clinicName: e.target.value }))}
                  placeholder="e.g. VINAY ORTHO CARE"
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Tagline / Type</label>
                <input
                  type="text"
                  value={header.tagline}
                  onChange={(e) => setHeader((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="e.g. Orthopaedic Hospital"
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Right Column — Doctor Details */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Doctor Details (Right)</p>

              {/* Doctor Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Doctor Name</label>
                <input
                  type="text"
                  value={header.doctorName}
                  onChange={(e) => setHeader((p) => ({ ...p, doctorName: e.target.value }))}
                  placeholder="e.g. DR. H. VINAY KUMAR"
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              {/* Credentials */}
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Credentials / Qualifications
                </label>
                <textarea
                  value={header.credentials}
                  onChange={(e) => setHeader((p) => ({ ...p, credentials: e.target.value }))}
                  placeholder={"MS Orthopaedics\nFellowship in Arthroscopy & Sports Medicine\nFellowship in Joint Replacement"}
                  rows={3}
                  className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors resize-none"
                />
                <p className="text-[10px] text-[#94A3B8] mt-1">One credential per line</p>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Specialization / Hospital Affiliation
                </label>
                <textarea
                  value={header.specialization}
                  onChange={(e) => setHeader((p) => ({ ...p, specialization: e.target.value }))}
                  placeholder={"Senior Consultant Orthopaedics\nYashoda Hospitals Secunderabad\nSpecialised in Arthroscopy, Sports Medicine"}
                  rows={3}
                  className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors resize-none"
                />
                <p className="text-[10px] text-[#94A3B8] mt-1">One line per affiliation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E2E8F0]" />

        {/* ── Footer Config ─────────────────────────────── */}
        <div>
          <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
            Footer Configuration
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Footer Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-48 h-12 rounded-xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center bg-[#F8FAFC] overflow-hidden flex-shrink-0">
                  {footerPreview ? (
                    <img
                      src={footerPreview}
                      alt="Footer preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon size={24} className="text-[#CBD5E1]" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={footerFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleFooterUpload}
                  />
                  <button
                    type="button"
                    onClick={() => footerFileInputRef.current?.click()}
                    disabled={uploadingFooter}
                    className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-lg hover:bg-[#DBEAFE] transition-colors disabled:opacity-50"
                  >
                    <Upload size={13} />
                    {uploadingFooter ? "Uploading..." : "Upload Footer"}
                  </button>
                  {footerPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveFooter}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X size={12} /> Remove
                    </button>
                  )}
                  <p className="text-[10px] text-[#94A3B8]">Full width image recommended. PNG/JPG.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E2E8F0]" />

        {/* ── Billing Config ─────────────────────────────── */}
        <div>
          <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
            Billing Print Configuration
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Billing Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center bg-[#F8FAFC] overflow-hidden flex-shrink-0">
                  {billingLogoPreview ? (
                    <img
                      src={billingLogoPreview}
                      alt="Billing Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon size={24} className="text-[#CBD5E1]" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={billingFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleBillingLogoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => billingFileInputRef.current?.click()}
                    disabled={uploadingBillingLogo}
                    className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-lg hover:bg-[#DBEAFE] transition-colors disabled:opacity-50"
                  >
                    <Upload size={13} />
                    {uploadingBillingLogo ? "Uploading..." : "Upload Billing Logo"}
                  </button>
                  {billingLogoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveBillingLogo}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X size={12} /> Remove
                    </button>
                  )}
                  <p className="text-[10px] text-[#94A3B8]">PNG, JPG, SVG or WEBP. Max 5 MB.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E2E8F0]" />

        {/* ── Live Preview ─────────────────────────────── */}
        <div>
          <button
            type="button"
            onClick={() => setPreviewOpen((v) => !v)}
            className="flex items-center gap-2 text-[13px] font-bold text-[#2563EB] hover:underline"
          >
            {previewOpen ? <EyeOff size={15} /> : <Eye size={15} />}
            {previewOpen ? "Hide Preview" : "Show Print Preview"}
          </button>

          {previewOpen && (
            <div className="mt-4 border-2 border-dashed border-[#E2E8F0] rounded-xl bg-[#FAFAFA] p-4 text-black">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
                Preview — how it will appear on printed A4
              </p>

              {/* Header Preview */}
              {hasHeaderContent ? (
                <div className="flex items-start justify-between border-b border-gray-400 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="h-14 w-auto object-contain" />
                    )}
                    <div>
                      {header.clinicName && (
                        <p className="text-[15px] font-black text-[#1E293B] leading-tight">{header.clinicName}</p>
                      )}
                      {header.tagline && (
                        <p className="text-[11px] text-[#64748B]">{header.tagline}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right max-w-[55%]">
                    {header.doctorName && (
                      <p className="text-[14px] font-black text-[#1E293B]">{header.doctorName}</p>
                    )}
                    {header.credentials && (
                      <div className="text-[10px] text-[#475569] whitespace-pre-line leading-snug mt-0.5">
                        {header.credentials}
                      </div>
                    )}
                    {header.specialization && (
                      <div className="text-[10px] font-semibold text-[#1E293B] whitespace-pre-line leading-snug mt-0.5">
                        {header.specialization}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-b border-dashed border-gray-300 pb-3 mb-3 text-center text-[11px] text-[#94A3B8] italic">
                  Header area — empty (configure above to add clinic branding)
                </div>
              )}

              {/* Content area placeholder */}
              <div className="border border-dashed border-gray-200 rounded-lg p-3 text-center text-[11px] text-[#94A3B8] italic mb-3">
                ... consultation content (patient info, prescriptions, etc.) ...
              </div>

              {/* Footer Preview */}
              {hasFooterContent ? (
                <div className="mt-8 pt-4 border-t border-gray-400 w-full flex justify-center">
                  {footerPreview && <img src={footerPreview} alt="Footer" className="max-w-full h-auto object-contain" style={{ maxHeight: '100px' }} />}
                </div>
              ) : (
                <div className="border-t border-dashed border-gray-300 pt-3 text-center text-[11px] text-[#94A3B8] italic">
                  Footer area — empty (configure above to add address & contact)
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Save Button ─────────────────────────────── */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-[13px] font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Print Settings"}
          </button>
        </div>
      </div>
    </SettingsSection>
  );
}
