"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

const roles = ["Admin", "Receptionist", "Doctor", "Pharmacist"] as const;
type Role = (typeof roles)[number];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("Receptionist");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const user = await login({ username, password, role });
      toast.success("Login successful!");
      
      if (user.role === "ADMIN") {
        router.push("/dashboard");
      } else if (user.role === "RECEPTIONIST") {
        router.push("/registration");
      } else if (user.role === "DOCTOR") {
        router.push("/consultation");
      } else if (user.role === "PHARMACIST") {
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

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#6b0019 0%,#800020 45%,#900015 100%)",
      }}
    >
      {/* Background Shapes */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "1500px",
          height: "1500px",
          top: "-700px",
          left: "-300px",
          background: "rgba(255,255,255,0.04)",
        }}
      />

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "1800px",
          height: "1800px",
          bottom: "-1200px",
          right: "-500px",
          background: "rgba(255,255,255,0.03)",
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
          <h6 className="text-white text-[72px] font-extrabold leading-[1.05]">
            Advanced Care,
            <br />
            Seamless
            <br />
            <span className="text-[#F04C23]">Management.</span>
          </h6>

          <div className="w-24 h-[5px] rounded-full bg-[#F04C23] mt-8 mb-8" />


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

            <h1 className="text-[28px] font-extrabold text-[#7c1414]">
              Welcome Back!
            </h1>

            <p className="text-[#888] text-[13px] mt-2">
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
                className={`h-[88px] rounded-xl border transition-all flex flex-col items-center justify-center ${
                  role === r
                    ? "border-[#E12D45] bg-[#fff5f6] text-[#800020]"
                    : "border-[#ececec] text-[#6B7280] hover:border-[#E12D45]"
                }`}
              >
                <span className="text-[28px] font-bold">
                  {r.charAt(0)}
                </span>

                <span className="text-[13px] mt-1">{r}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-5">
              <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a32a2a]">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 border border-[#f0d5d5] rounded-lg outline-none focus:border-[#a32a2a]"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a32a2a]">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 border border-[#f0d5d5] rounded-lg outline-none focus:border-[#a32a2a]"
                />

                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a32a2a]"
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

            {/* Remember Me */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center gap-2 text-[#a32a2a]">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => toast("Password reset functionality will be available in a future release. Please contact the administrator.")}
                className="text-[#a32a2a] font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-[1px]"
              style={{
                background:
                  "linear-gradient(90deg,#9e1d1d 0%,#520b0b 100%)",
                boxShadow:
                  "0 4px 12px rgba(124,20,20,0.3)",
              }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        

        
        </div>
      </div>
    </div>
  );
}