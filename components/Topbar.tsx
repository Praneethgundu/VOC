"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getSystemAlerts, SystemAlert } from "@/services/dashboardService";
import Link from "next/link";

interface NavbarProps {
  pageTitle?: string;
  breadcrumb?: string;
}

export default function Navbar({ pageTitle, breadcrumb }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAlerts = () => getSystemAlerts().then(setAlerts).catch(console.error);
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlerts(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayInitial = currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : "A";
  const displayName = currentUser?.username ? currentUser.username : "User";
  const displayRole = currentUser?.role ? currentUser.role : "";

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Left: Page info */}
      <div>
        {breadcrumb && (
          <p className="text-[11px] text-[#64748B] font-medium mb-0.5 uppercase tracking-wider">
            {breadcrumb}
          </p>
        )}
        {pageTitle && (
          <h1 className="page-title !text-[18px]">{pageTitle}</h1>
        )}
        {!pageTitle && !breadcrumb && (
          <h2 className="text-[16px] font-bold text-[#1E293B]">
            VOC Orthopaedic Hospital
          </h2>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 h-9 w-56">
          <Search size={14} className="text-[#64748B] shrink-0" />
          <input
            type="text"
            placeholder="Search…"
            className="bg-transparent outline-none text-[13px] text-[#1E293B] placeholder:text-[#64748B] w-full"
          />
        </div>

        {/* Bell */}
        <div className="relative" ref={alertsRef}>
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative w-9 h-9 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <Bell size={16} />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                {alerts.length}
              </span>
            )}
          </button>
          
          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-hidden z-50">
              <div className="bg-gray-50 px-4 py-3 border-b border-[#E2E8F0] flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#1E293B]">System Alerts</h3>
                <span className="text-[10px] bg-[#2563EB] text-white px-2 py-0.5 rounded-full font-bold">{alerts.length} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No active alerts
                  </div>
                ) : (
                  alerts.map((alert, idx) => (
                    <Link href={alert.actionPath} key={alert.id} className="block border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC] transition-colors p-4">
                      <div className="flex gap-3 items-start">
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                          alert.type === 'warning' ? 'bg-[#FFFBEB] text-[#92400E]' : 
                          alert.type === 'error' ? 'bg-[#FEE2E2] text-[#2563EB]' : 
                          'bg-[#DBEAFE] text-[#0284C7]'
                        }`}>
                          {alert.type === 'warning' ? <AlertTriangle size={14} /> : 
                           alert.type === 'error' ? <ShieldAlert size={14} /> : 
                           <Info size={14} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{alert.module}</p>
                          <p className="text-xs font-bold text-[#1E293B] mb-1">{alert.title}</p>
                          <p className="text-xs text-[#64748B] leading-tight">{alert.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar / User */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg border border-[#E2E8F0] bg-white hover:border-[rgba(15,23,42,0.2)] transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB] to-[#0F172A] flex items-center justify-center text-white text-[11px] font-bold">
              {displayInitial}
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] hidden sm:block capitalize">
              {displayName}
            </span>
            <ChevronDown size={13} className="text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E2E8F0] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-[13px] font-semibold text-[#1E293B] capitalize">{displayName}</p>
                <p className="text-[11px] text-[#64748B] capitalize mt-0.5">{displayRole.toLowerCase()}</p>
              </div>
              <div className="py-1">
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <UserIcon size={14} />
                  Profile
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}