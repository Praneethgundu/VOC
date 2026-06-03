import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import RegistrationForm from "@/components/registration/RegistrationForm";
import PatientTable from "@/components/registration/PatientTable";

export const metadata = { title: "Registration — VOC Orthopaedic HMS" };

export default function RegistrationPage() {
  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Patient Registration" breadcrumb="Registration" />
        <main className="flex-1 p-6 space-y-6">
          <RegistrationForm />
          <PatientTable />
        </main>
      </div>
    </div>
  );
}