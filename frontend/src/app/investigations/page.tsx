import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import InvestigationForm from "@/components/investigations/InvestigationForm";
import InvestigationsTable from "@/components/investigations/InvestigationsTable";

export const metadata = { title: "Investigations — VOC Orthopaedic HMS" };

export default function InvestigationPage() {
  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Investigations" breadcrumb="Lab & Radiology" />
        <main className="flex-1 p-6">
          <InvestigationForm />
          <InvestigationsTable />
        </main>
      </div>
    </div>
  );
}