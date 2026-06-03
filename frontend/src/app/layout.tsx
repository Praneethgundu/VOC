import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/auth-context";
import ProtectedRoute from "../components/ProtectedRoute";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "VOC Orthopaedic HMS | Hospital Management System",
  description:
    "A modern Hospital Management System for VOC Orthopaedic Hospital — manage patients, consultations, billing, pharmacy and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}