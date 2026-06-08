"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

const roleRouteMap: Record<string, string[]> = {
  RECEPTIONIST: ["/dashboard", "/registration", "/consultation", "/investigations", "/ot", "/pharmacy", "/billing", "/reports", "/reports/eod", "/patient-records", "/settings"],
  DOCTOR: ["/dashboard", "/consultation", "/investigations", "/ot", "/reports", "/reports/eod", "/patient-records"],
  PHARMACIST: ["/dashboard", "/pharmacy", "/reports/eod", "/patient-records"],
  ADMIN: ["/dashboard", "/registration", "/consultation", "/investigations", "/ot", "/pharmacy", "/billing", "/reports", "/reports/eod", "/patient-records", "/settings"],
};

const defaultLandingPage: Record<string, string> = {
  RECEPTIONIST: "/dashboard",
  DOCTOR: "/consultation",
  PHARMACIST: "/pharmacy",
  ADMIN: "/dashboard",
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Compute allowed status synchronously to prevent UI flicker
  const isPublicRoute = pathname === "/login" || pathname === "/";
  let isAllowed = false;
  
  if (isAuthenticated && role) {
    const allowedRoutes = roleRouteMap[role.toUpperCase()] || [];
    isAllowed = allowedRoutes.some(route => pathname.startsWith(route));
  }

  useEffect(() => {
    if (isLoading) return;

    if (!isPublicRoute) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (role && !isAllowed) {
        toast.error("Unauthorized Access");
        const landingPage = defaultLandingPage[role.toUpperCase()] || "/dashboard";
        router.push(landingPage);
      }
    } else {
      // If authenticated and trying to access login, redirect to landing page
      if (isAuthenticated && role) {
        const landingPage = defaultLandingPage[role.toUpperCase()] || "/dashboard";
        router.push(landingPage);
      }
    }
  }, [isAuthenticated, isLoading, router, pathname, role, isAllowed, isPublicRoute]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isPublicRoute) {
    // If authenticated, we are redirecting away, so render nothing to avoid showing login page flicker.
    return isAuthenticated ? null : <>{children}</>;
  }

  if (!isAuthenticated || !isAllowed) {
    // Wait for useEffect to perform redirect without rendering restricted content
    return null;
  }

  return <>{children}</>;
}
