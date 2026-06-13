import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";
import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Toaster } from "sonner";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "VOC Orthopaedic HMS | Hospital Management System",
  description:
    "A modern Hospital Management System for VOC Orthopaedic Hospital — manage patients, consultations, billing, pharmacy and more.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const bodyBgClass = token ? "bg-[#F8FAFC]" : "bg-[#0F172A]";
  const hasToken = !!token;

  return (
    <html lang="en">
      <body className={`antialiased ${bodyBgClass}`}>
        <AuthProvider initialHasSession={hasToken}>
          <ClientAuthGuard>
            {children}
          </ClientAuthGuard>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}