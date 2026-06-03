import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import PharmacyForm from "@/components/pharmacy/PharmacyForm";
import MedicineTable from "@/components/pharmacy/MedicineTable";
import LowStockAlerts from "@/components/pharmacy/LowStockAlerts";

export const metadata = { title: "Pharmacy — VOC Orthopaedic HMS" };

export default function PharmacyPage() {
  return (
    <div className="flex bg-[#FDF8F8] min-h-screen">
      <Sidebar />
      <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
        <Navbar pageTitle="Pharmacy" breadcrumb="Inventory & Dispensing" />
        <main className="flex-1 p-6 space-y-6">
          <LowStockAlerts />
          <PharmacyForm />
          <MedicineTable />
        </main>
      </div>
    </div>
  );
}