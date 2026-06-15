import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import PatientRecordsLayout from "@/components/patient-records/PatientRecordsLayout";

export default function PatientRecordsPage() {
  return (
    <ProtectedRoute>
      <div className="flex bg-[#F8F9FA] min-h-screen print:block">
        <Sidebar />
        <div className="ml-[248px] flex-1 flex flex-col h-screen overflow-hidden print:ml-0 print:h-auto print:overflow-visible print:w-full">
          <PatientRecordsLayout />
        </div>
      </div>
    </ProtectedRoute>
  );
}
