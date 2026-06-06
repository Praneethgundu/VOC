"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
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
    getSystemAlerts().then(setAlerts).catch(console.error);
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
    <header className="h-16 bg-white border-b border-[#ECECEC] flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Left: Page info */}
      <div>
        {breadcrumb && (
          <p className="text-[11px] text-[#6B7280] font-medium mb-0.5 uppercase tracking-wider">
            {breadcrumb}
          </p>
        )}
        {pageTitle && (
          <h1 className="page-title !text-[18px]">{pageTitle}</h1>
        )}
        {!pageTitle && !breadcrumb && (
          <h2 className="text-[16px] font-bold text-[#1A2332]">
            VOC Orthopaedic Hospital
          </h2>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#FDF8F8] border border-[#ECECEC] rounded-lg px-3 h-9 w-56">
          <Search size={14} className="text-[#6B7280] shrink-0" />
          <input
            type="text"
            placeholder="Search…"
            className="bg-transparent outline-none text-[13px] text-[#1A2332] placeholder:text-[#9CA3AF] w-full"
          />
        </div>

        {/* Bell */}
        <div className="relative" ref={alertsRef}>
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative w-9 h-9 rounded-lg border border-[#ECECEC] bg-white flex items-center justify-center text-[#6B7280] hover:border-[#E12D45] hover:text-[#E12D45] transition-colors"
          >
            <Bell size={16} />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E12D45] border-2 border-white text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                {alerts.length}
              </span>
            )}
          </button>
          
          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#ECECEC] overflow-hidden z-50">
              <div className="bg-gray-50 px-4 py-3 border-b border-[#ECECEC] flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#1A2332]">System Alerts</h3>
                <span className="text-[10px] bg-[#E12D45] text-white px-2 py-0.5 rounded-full font-bold">{alerts.length} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No active alerts
                  </div>
                ) : (
                  alerts.map((alert, idx) => (
                    <Link href={alert.actionPath} key={alert.id} className="block border-b border-[#ECECEC] last:border-0 hover:bg-[#FDF8F8] transition-colors p-4">
                      <div className="flex gap-3 items-start">
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                          alert.type === 'warning' ? 'bg-[#FFFBEB] text-[#D97706]' : 
                          alert.type === 'error' ? 'bg-[#FFF4F4] text-[#E12D45]' : 
                          'bg-[#F0F9FF] text-[#0284C7]'
                        }`}>
                          {alert.type === 'warning' ? <AlertTriangle size={14} /> : 
                           alert.type === 'error' ? <ShieldAlert size={14} /> : 
                           <Info size={14} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{alert.module}</p>
                          <p className="text-xs font-bold text-[#1A2332] mb-1">{alert.title}</p>
                          <p className="text-xs text-[#6B7280] leading-tight">{alert.message}</p>
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
            className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg border border-[#ECECEC] bg-white hover:border-[rgba(128,0,32,0.2)] transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E12D45] to-[#800020] flex items-center justify-center text-white text-[11px] font-bold">
              {displayInitial}
            </div>
            <span className="text-[13px] font-semibold text-[#1A2332] hidden sm:block capitalize">
              {displayName}
            </span>
            <ChevronDown size={13} className="text-[#6B7280] group-hover:text-[#800020] transition-colors" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#ECECEC] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#ECECEC]">
                <p className="text-[13px] font-semibold text-[#1A2332] capitalize">{displayName}</p>
                <p className="text-[11px] text-[#6B7280] capitalize mt-0.5">{displayRole.toLowerCase()}</p>
              </div>
              <div className="py-1">
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-[#4B5563] hover:bg-[#FDF8F8] hover:text-[#E12D45] transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <UserIcon size={14} />
                  Profile
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-[#4B5563] hover:bg-[#FDF8F8] hover:text-[#E12D45] transition-colors"
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