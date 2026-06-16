"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { MessageCircle, Save } from "lucide-react";
import { SettingsSection } from "@/app/(dashboard)/settings/page";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EodWhatsAppSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchPhoneNumber();
  }, []);

  const fetchPhoneNumber = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data.whatsapp_eod_number) {
        setPhoneNumber(res.data.whatsapp_eod_number);
      }
    } catch (error) {
      console.error("Failed to fetch settings");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post("/settings", {
        key: "whatsapp_eod_number",
        value: phoneNumber.trim()
      });
      toast.success("WhatsApp Number saved successfully!");
    } catch (error) {
      toast.error("Failed to save number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      icon={MessageCircle}
      title="EOD WhatsApp Notifications"
      subtitle="Configure the phone number that receives the automated End-Of-Day WhatsApp report"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-end max-w-xl">
        <div className="flex-1 w-full">
          {initialLoading ? (
             <p className="text-sm text-gray-500 py-2">Loading...</p>
          ) : (
            <Input
              label="WhatsApp Phone Number"
              placeholder="+91 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              hint="Include country code without spaces (e.g., +919876543210)"
            />
          )}
        </div>
        {!initialLoading && (
          <div className="pb-[22px]">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              icon={<Save size={15} />}
            >
              {loading ? "Saving..." : "Save Number"}
            </Button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
