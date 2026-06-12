import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata = { title: "Financials — VOC Orthopaedic HMS" };

export default function FinancialsPage() {
  return (
    <ProtectedRoute>
      <div className="flex bg-[#F8FAFC] min-h-screen">
        <Sidebar />

        <div className="ml-[248px] flex-1 flex flex-col min-h-screen">
          <Navbar pageTitle="Financial Reports" breadcrumb="Management" />

          <main className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="page-title">Revenue & Expense Tracking</h1>
                <p className="text-[#64748B] text-[13px] mt-1">
                  Daily collection summaries and financial overviews.
                </p>
              </div>
              <button className="px-4 py-2 bg-[#2563EB] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm">
                + Export Report
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Dashboard */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-center">
                <h2 className="section-heading mb-4">Revenue Dashboard</h2>
                <div className="flex items-center justify-between mb-2 text-[#64748B] text-[13px]">
                  <span>Total Revenue</span>
                  <span className="font-bold text-[#059669]">↑ 12%</span>
                </div>
                <div className="text-[28px] font-extrabold text-[#1E293B] mb-4">₹ 5,30,000</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-[#64748B]">Consultations</span>
                      <span className="font-semibold">₹ 1,20,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F8FAFC] rounded-full"><div className="h-full bg-[#2563EB] rounded-full" style={{ width: "25%" }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-[#64748B]">Pharmacy</span>
                      <span className="font-semibold">₹ 2,10,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F8FAFC] rounded-full"><div className="h-full bg-[#92400E] rounded-full" style={{ width: "40%" }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-[#64748B]">Lab & Imaging</span>
                      <span className="font-semibold">₹ 2,00,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F8FAFC] rounded-full"><div className="h-full bg-[#7C3AED] rounded-full" style={{ width: "35%" }} /></div>
                  </div>
                </div>
              </div>

              {/* Expense Tracking */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
                <h2 className="section-heading mb-4">Expense Tracking</h2>
                <div className="flex items-center justify-between mb-2 text-[#64748B] text-[13px]">
                  <span>Monthly Expenses</span>
                  <span className="font-bold text-[#2563EB]">↑ 5%</span>
                </div>
                <div className="text-[28px] font-extrabold text-[#1E293B] mb-4">₹ 1,80,000</div>
                <ul className="space-y-3 mt-4">
                  <li className="flex justify-between items-center text-[13px]">
                    <span className="text-[#64748B]">Payroll</span>
                    <span className="font-semibold text-[#1E293B]">₹ 90,000</span>
                  </li>
                  <li className="flex justify-between items-center text-[13px]">
                    <span className="text-[#64748B]">Medical Supplies</span>
                    <span className="font-semibold text-[#1E293B]">₹ 45,000</span>
                  </li>
                  <li className="flex justify-between items-center text-[13px]">
                    <span className="text-[#64748B]">Utilities & Maintenance</span>
                    <span className="font-semibold text-[#1E293B]">₹ 25,000</span>
                  </li>
                  <li className="flex justify-between items-center text-[13px]">
                    <span className="text-[#64748B]">Miscellaneous</span>
                    <span className="font-semibold text-[#1E293B]">₹ 20,000</span>
                  </li>
                </ul>
              </div>

              {/* Daily Collection */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
                <h2 className="section-heading mb-4">Daily Collection Summary</h2>
                <div className="text-[28px] font-extrabold text-[#059669] mb-4">₹ 42,500</div>
                <p className="text-[12px] text-[#64748B] mb-4">Collected today across all departments.</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 bg-[#ECFDF5] rounded-lg border border-[#ECFDF5]">
                    <p className="text-[11px] text-[#047857] font-bold">CASH</p>
                    <p className="text-[15px] font-extrabold text-[#059669] mt-1">₹ 12,000</p>
                  </div>
                  <div className="p-3 bg-[#DBEAFE] rounded-lg border border-[#DBEAFE]">
                    <p className="text-[11px] text-[#1D4ED8] font-bold">UPI / CARD</p>
                    <p className="text-[15px] font-extrabold text-[#2563EB] mt-1">₹ 30,500</p>
                  </div>
                </div>
                <button type="button" className="w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-[13px] font-semibold hover:border-[rgba(15,23,42,0.2)] hover:text-[#0F172A] transition-colors">
                  View Detailed Log
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
