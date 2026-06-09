"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function EODReportPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (role === "ADMIN") {
      router.replace("/reports/eod/admin");
    } else if (role === "RECEPTIONIST") {
      router.replace("/reports/eod/reception");
    } else if (role === "DOCTOR") {
      router.replace("/reports/eod/doctor");
    } else if (role === "PHARMACIST") {
      router.replace("/reports/eod/pharmacy");
    } else {
      router.replace("/dashboard");
    }
  }, [role, isLoading, router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting to your EOD report...</div>;
}
