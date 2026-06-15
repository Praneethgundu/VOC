"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import api from "@/services/api";

const roles = ["Admin", "Receptionist", "Doctor", "Pharmacist"] as const;
type Role = (typeof roles)[number];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("Receptionist");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isPinMode, setIsPinMode] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await login({ username, password, role });
      
      if (response.requiresPasswordChange) {
        setIsResetMode(true);
        setResetToken(response.resetToken);
        return;
      }

      toast.success("Login successful!");
      
      if (response.role === "ADMIN") {
        router.push("/dashboard");
      } else if (response.role === "RECEPTIONIST") {
        router.push("/dashboard");
      } else if (response.role === "DOCTOR") {
        router.push("/consultation");
      } else if (response.role === "PHARMACIST") {
        router.push("/pharmacy");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast.error("Please enter your username.");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await api.post("/auth/reset-request", { username });
      if (response.data.success) {
        toast.success(response.data.message || "Reset requested successfully! Ask the administrator for your PIN.");
        setIsForgotMode(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to request reset.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/change-credentials", { resetToken, newPassword });
      if (response.data.success) {
        toast.success("Password updated successfully! Please log in.");
        setIsResetMode(false);
        setPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden animate-fade-in"
      style={{
        background:
          "linear-gradient(135deg, #020617 0%, #0F172A 50%, #0B1120 100%)",
      }}
    >
      {/* Background Shapes */}
      <div
        className="absolute rounded-full pointer-events-none blur-[120px]"
        style={{
          width: "1000px",
          height: "1000px",
          top: "-400px",
          left: "-200px",
          background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(15,23,42,0) 70%)",
        }}
      />

      <div
        className="absolute rounded-full pointer-events-none blur-[100px]"
        style={{
          width: "800px",
          height: "800px",
          bottom: "-200px",
          right: "-100px",
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(15,23,42,0) 70%)",
        }}
      />

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 relative z-10 px-20 py-16 flex-col justify-center">
        {/* Logo */}
        <div className="absolute top-16 left-20 flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <Image
              src="/images/logo.jpeg"
              alt="VOC Ortho"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-white font-extrabold text-[22px]">
              VOC Orthopaedic Hospital
            </h2>

            <p className="text-white/70 text-sm">
              Official Hospital Management System
            </p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-[500px]">
          <h6 className="text-white text-[48px] font-extrabold leading-[1.05]">
            Advanced Care,
            <br />
            Seamless
            <br />
            <span className="text-[#2563EB]">Management.</span>
          </h6>

          <div className="w-24 h-[5px] rounded-full bg-[#2563EB] mt-8 mb-8" />


        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[560px] flex items-center justify-center px-6 lg:px-10 relative z-10">
        <div
          className="w-full max-w-[500px] bg-white rounded-[24px] p-10 lg:p-12"
          style={{
            boxShadow: "0 24px 60px rgba(0,0,0,0.30)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/logo.jpeg"
              alt="VOC Ortho"
              width={56}
              height={56}
              className="mx-auto mb-4 rounded-lg"
            />

            <h1 className="text-[28px] font-extrabold text-[#334155]">
              Welcome Back!
            </h1>

            <p className="text-[#64748B] text-[13px] mt-2">
              Please sign in to your account to continue
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`h-[88px] rounded-xl border transition-all duration-300 flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-md ${
                  role === r
                    ? "border-[#2563EB] bg-blue-50/50 text-[#0F172A] shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
                    : "border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]/50"
                }`}
              >
                <span className={`text-[28px] font-bold transition-colors duration-300 ${role === r ? "text-[#2563EB]" : ""}`}>
                  {r.charAt(0)}
                </span>

                <span className={`text-[13px] mt-1 transition-colors duration-300 ${role === r ? "font-bold text-[#1E293B]" : ""}`}>
                  {r}
                </span>
              </button>
            ))}
          </div>

          {/* Form */}
          {isResetMode ? (
            <form onSubmit={handleResetSubmit}>
              <div className="mb-5">
                <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#1E293B]">
                  Create New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 border border-[#E2E8F0] rounded-lg outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Must be at least 6 characters long.</p>
              </div>

              <div className="flex gap-4 mb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-[1px]"
                  style={{
                    background: "linear-gradient(90deg,#2563EB 0%,#1E40AF 100%)",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          ) : isForgotMode ? (
            <form onSubmit={handleForgotSubmit}>
              <div className="mb-5">
                <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#1E293B]">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 px-4 border border-[#E2E8F0] rounded-lg outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="flex-1 h-[54px] rounded-lg text-[#64748B] font-bold bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 h-[54px] rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-[1px]"
                  style={{
                    background: "linear-gradient(90deg,#2563EB 0%,#1E40AF 100%)",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                >
                  {forgotLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Request Reset"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="mb-5">
                <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#1E293B]">
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 px-4 border border-[#E2E8F0] rounded-lg outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all duration-300"
                />
              </div>

              {/* Password or PIN */}
              <div className="mb-5">
                <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#1E293B]">
                  {isPinMode ? "Temporary PIN" : "Password"}
                </label>

                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={isPinMode ? "Enter Temporary PIN" : "Enter Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 border border-[#E2E8F0] rounded-lg outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all duration-300"
                  />

                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Links */}
              <div className="flex flex-col gap-3 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-[#1E293B]">
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setIsPinMode(false);
                    }}
                    className="text-[#2563EB] font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsPinMode(!isPinMode)}
                  className="text-left text-[#64748B] font-medium hover:text-[#2563EB] transition-colors"
                >
                  {isPinMode ? "← Back to Normal Login" : "Login with Temporary PIN?"}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[54px] rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)]"
                style={{
                  background:
                    "linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)",
                }}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isPinMode ? "Verify PIN" : "Sign In"}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

        

        
        </div>
      </div>
    </div>
  );
}