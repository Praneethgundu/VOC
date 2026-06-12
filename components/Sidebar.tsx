"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  Microscope,
  Pill,
  Receipt,
  FileText,
  Settings,
  Scissors,
  TrendingUp,
  FolderOpen
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", baseRoute: "/dashboard" },
  { name: "Registration", icon: UserPlus, path: "/registration", baseRoute: "/registration" },
  { name: "Consultation", icon: Stethoscope, path: "/consultation", baseRoute: "/consultation" },
  { name: "Investigations", icon: Microscope, path: "/investigations", baseRoute: "/investigations" },
  { name: "OT Procedures", icon: Scissors, path: "/ot", baseRoute: "/ot" },
  { name: "Pharmacy", icon: Pill, path: "/pharmacy", baseRoute: "/pharmacy" },
  { name: "Billing", icon: Receipt, path: "/billing", baseRoute: "/billing" },
  { name: "Reports", icon: FileText, path: "/reports", baseRoute: "/reports" },
  { name: "EOD Report", icon: FileText, path: "/reports/eod", baseRoute: "/reports/eod" },
  { name: "Patient Records", icon: FolderOpen, path: "/records", baseRoute: "/records" },
  { name: "Settings", icon: Settings, path: "/settings", baseRoute: "/settings" },
];

const roleRouteMap: Record<string, string[]> = {
  RECEPTIONIST: ["/dashboard", "/registration", "/consultation", "/investigations", "/ot", "/pharmacy", "/billing", "/reports", "/reports/eod", "/records", "/settings"],
  DOCTOR: ["/dashboard", "/consultation", "/investigations", "/ot", "/reports", "/reports/eod", "/records"],
  PHARMACIST: ["/dashboard", "/pharmacy", "/reports/eod", "/records"],
  ADMIN: ["/dashboard", "/registration", "/consultation", "/investigations", "/ot", "/pharmacy", "/billing", "/reports", "/reports/eod", "/records", "/settings"],
};

const getDynamicPath = (baseRoute: string, role?: string | null) => {
  if (baseRoute === "/reports/eod" && role) {
    if (role === "RECEPTIONIST") return "/reports/eod/reception";
    if (role === "DOCTOR") return "/reports/eod/doctor";
    if (role === "PHARMACIST") return "/reports/eod/pharmacy";
    if (role === "ADMIN") return "/reports/eod/admin";
  }
  return baseRoute;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const allowedRoutes = role ? (roleRouteMap[role.toUpperCase()] || []) : [];
  const filteredMenuItems = menuItems.filter((item) => allowedRoutes.includes(item.path));

  return (
    <aside
      className="w-[248px] h-screen fixed left-0 top-0 flex flex-col z-40 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0F172A 0%, #0F172A 42%, #0F172A 100%)",
      }}
    >
      {/* Logo / Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white/10 flex items-center justify-center border border-white/20">
            <Image
              src="/images/logo.jpeg"
              alt="VOC Ortho Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-[15px] leading-tight">
              VOC Ortho HMS
            </h1>
            <p className="text-white/50 text-[11px] font-medium mt-0.5">
              Hospital Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5 scrollbar-none">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
          Main Menu
        </p>

        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const actualPath = getDynamicPath(item.baseRoute, role);
          const isActive = pathname.startsWith(actualPath) && (actualPath !== "/dashboard" || pathname === "/dashboard");

          return (
            <Link
              key={item.name}
              href={actualPath}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200 group",
                isActive
                  ? "bg-[#2563EB] text-white font-semibold"
                  : "text-white/70 hover:bg-white/8 hover:text-white",
              ].join(" ")}
              style={
                isActive
                  ? { boxShadow: "0 4px 14px rgba(37,99,235,0.45)" }
                  : {}
              }
            >
              <Icon
                size={17}
                className={
                  isActive
                    ? "text-white"
                    : "text-white/60 group-hover:text-white transition-colors"
                }
              />
              <span className="text-[13.5px] leading-none">{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer tag */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/30 text-[11px] text-center font-medium">
          © 2025 VOC Orthopaedic
        </p>
      </div>
    </aside>
  );
}