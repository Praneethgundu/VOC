"use client";

import { PatientRecord } from "@/services/patientRecordService";
import { FileText, Calendar, Activity, Scissors, Pill, Stethoscope, Printer, Download, Share2 } from "lucide-react";
import PatientTimeline from "./PatientTimeline";

interface PatientDetailViewerProps {
  record: PatientRecord;
}

export default function PatientDetailViewer({ record }: PatientDetailViewerProps) {
  const p = record.profile;
  const totalBilled = record.bills.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const totalPaid = record.bills.filter(b => b.status === "Paid").reduce((sum, b) => sum + Number(b.total || 0), 0);

  // Determine status (basic heuristic)
  let status = "Registered";
  if (record.consultations.length > 0) {
    const lastCons = record.consultations[record.consultations.length - 1];
    status = lastCons.status === "Completed" ? "Done" : "Waiting";
  }

  const handleWhatsApp = () => {
    const text = `*VOC Orthopaedic Hospital - Patient Record*\nName: ${p.fullName}\nOP Number: ${p.opNumber}\nTotal Paid: ₹${totalPaid}\nOutstanding: ₹${totalBilled - totalPaid}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      
      {/* Export Options */}
      <div className="flex justify-end gap-3 print:hidden">
        <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#1da851] transition">
          <Share2 size={16} /> WhatsApp
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition">
          <Printer size={16} /> Print Record
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition">
          <Download size={16} /> PDF / Excel
        </button>
      </div>

      {/* Patient Header Card (Dark Red) */}
      <div className="bg-[#800020] rounded-xl text-white p-6 shadow-md relative overflow-hidden">
        {/* Subtle background pattern/gradient could go here if needed */}
        <div className="flex justify-between items-start z-10 relative">
          <div>
            <h2 className="text-[22px] font-bold mb-1">{p.fullName}</h2>
            <p className="text-[#FDF8F8] text-[14px] opacity-90">
              {p.opNumber} • {p.age}y / {p.gender} • {p.bloodGroup}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-[12px] opacity-70 uppercase tracking-wider mb-0.5">Contact</p>
            <p className="font-semibold text-[15px]">{p.phone}</p>
          </div>

          <div className="text-right max-w-[200px]">
            <p className="text-[12px] opacity-70 uppercase tracking-wider mb-0.5">Doctor & Dept</p>
            <p className="font-semibold text-[15px]">{p.doctor || "Unassigned"}</p>
            <p className="text-[13px] opacity-90">({p.department || "General"})</p>
          </div>
        </div>

        <div className="mt-8 z-10 relative flex gap-12">
          <div>
            <p className="text-[12px] opacity-70 uppercase tracking-wider mb-0.5">Status</p>
            <p className="font-bold text-[18px]">{status}</p>
          </div>
          <div>
            <p className="text-[12px] opacity-70 uppercase tracking-wider mb-0.5">Patient Complaint</p>
            <p className="font-bold text-[18px]">{p.complaint || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Billing & Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-[#ECECEC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ECECEC] flex justify-between items-center bg-[#FDF8F8]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#800020] opacity-70" />
            <h3 className="font-bold text-[#800020] text-[16px]">Billing & Payments</h3>
          </div>
          <div className="font-bold text-[15px]">
            <span className="text-green-600">Total Paid: ₹{totalPaid.toLocaleString()}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-gray-600">₹{totalBilled.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="p-6">
          {record.bills.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No Billing Records Available</p>
          ) : (
            <div className="flex gap-8">
              {/* Invoices List */}
              <div className="w-1/3 border-r border-[#ECECEC] pr-8">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Invoices</p>
                <div className="space-y-4">
                  {record.bills.map((b) => (
                    <div key={b.id} className="border border-[#ECECEC] rounded-lg p-4 bg-gray-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-bold text-[#1A2332] text-[14px]">Invoice: {b.id}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${b.status === 'Paid' ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px] text-gray-600 mb-1">
                        <span className="flex items-center gap-1"><Calendar size={13}/> {new Date(b.date).toLocaleDateString()}</span>
                        <span>Billed: <strong className="text-gray-800">₹{b.total}</strong></span>
                      </div>
                      <div className="flex justify-between text-[13px] text-gray-600">
                        <span>Mode: <strong className="text-gray-800">{b.paymentMode}</strong></span>
                        <span>Paid: <strong className="text-gray-800">₹{b.status === 'Paid' ? b.total : 0}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Itemized Breakdown */}
              <div className="flex-1 pl-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Itemized Breakdown</p>
                <div className="space-y-3">
                  {record.bills.map(b => {
                    let items = [];
                    try { items = typeof b.items === 'string' ? JSON.parse(b.items) : b.items; } catch (e) {}
                    return items.map((item: any, i: number) => (
                      <div key={`${b.id}-${i}`} className="border border-[#ECECEC] rounded-lg p-4 flex justify-between items-center bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div>
                          <p className="font-bold text-[#800020] text-[14px]">{item.serviceName}</p>
                          <p className="text-[12px] text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar size={12}/> {new Date(b.date).toLocaleDateString()} · Inv {b.id}
                          </p>
                        </div>
                        <p className="font-bold text-[16px] text-[#1A2332]">₹{item.amount}</p>
                      </div>
                    ));
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investigations & Tests */}
      <div className="bg-white rounded-xl shadow-sm border border-[#ECECEC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ECECEC] bg-[#FDF8F8] flex items-center gap-2">
          <Activity size={18} className="text-[#800020] opacity-70" />
          <h3 className="font-bold text-[#800020] text-[16px]">Investigations & Tests</h3>
        </div>
        <div className="p-6">
          {record.investigations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No Investigations Available</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {record.investigations.map(i => (
                <div key={i.id} className="border border-[#ECECEC] rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-[#1A2332] text-[14px]">{i.testName}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${i.status === 'COMPLETED' ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
                      {i.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 mb-2">Ordered: {new Date(i.orderedDate).toLocaleDateString()} • {i.doctor}</p>
                  <div className="bg-gray-50 rounded p-3 text-[13px] border border-gray-100">
                    <span className="font-semibold text-gray-700">Result: </span>
                    <span className="text-gray-600">{i.result || "Pending"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Consultation History */}
      <div className="bg-white rounded-xl shadow-sm border border-[#ECECEC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ECECEC] bg-[#FDF8F8] flex items-center gap-2">
          <Stethoscope size={18} className="text-[#800020] opacity-70" />
          <h3 className="font-bold text-[#800020] text-[16px]">Consultation History</h3>
        </div>
        <div className="p-6">
          {record.consultations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No Consultations Available</p>
          ) : (
            <div className="space-y-4">
              {record.consultations.map(c => (
                <div key={c.id} className="border border-[#ECECEC] rounded-lg p-5 bg-white">
                  <div className="flex justify-between mb-4 border-b border-gray-100 pb-3">
                    <div>
                      <p className="font-bold text-[#1A2332] text-[15px]">{new Date(c.consultationDate).toLocaleDateString()}</p>
                      <p className="text-[13px] text-gray-500">{c.doctor} • {c.department}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider h-fit ${c.status === 'Completed' ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#F3F4F6] text-gray-600'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Complaints</p>
                      <p className="text-[13px] text-gray-800">{c.complaints || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
                      <p className="text-[13px] text-gray-800 font-semibold">{c.diagnosis || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinical Notes</p>
                      <p className="text-[13px] text-gray-800">{c.notes || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medicines Dispensed */}
      <div className="bg-white rounded-xl shadow-sm border border-[#ECECEC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ECECEC] bg-[#FDF8F8] flex items-center gap-2">
          <Pill size={18} className="text-[#800020] opacity-70" />
          <h3 className="font-bold text-[#800020] text-[16px]">Medicines Dispensed</h3>
        </div>
        <div className="p-6">
          {record.pharmacy.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No Medicines Dispensed</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECECEC] text-[12px] text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Medicine Name</th>
                    <th className="pb-3 font-bold">Dispensed Date</th>
                    <th className="pb-3 font-bold text-center">Quantity</th>
                    <th className="pb-3 font-bold text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {record.pharmacy.map((p: any) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-semibold text-[#1A2332]">{p.medicineName || p.medicineId}</td>
                      <td className="py-3 text-gray-600">{new Date(p.dispensedDate).toLocaleDateString()}</td>
                      <td className="py-3 text-center">{p.quantity}</td>
                      <td className="py-3 text-right font-bold">₹{p.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* OT Procedures */}
      <div className="bg-white rounded-xl shadow-sm border border-[#ECECEC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ECECEC] bg-[#FDF8F8] flex items-center gap-2">
          <Scissors size={18} className="text-[#800020] opacity-70" />
          <h3 className="font-bold text-[#800020] text-[16px]">OT / Procedures</h3>
        </div>
        <div className="p-6">
          {record.procedures.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No Procedures Available</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {record.procedures.map(p => (
                <div key={p.id} className="border border-[#ECECEC] rounded-lg p-4 bg-white flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#1A2332] text-[15px]">{p.procedure}</p>
                    <p className="text-[13px] text-gray-500 mt-1">{new Date(p.date).toLocaleDateString()} at {p.time} • Dr. {p.doctor}</p>
                    <p className="text-[13px] text-gray-700 mt-2">Notes: {p.notes}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'COMPLETED' ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#E0F2FE] text-[#0369A1]'}`}>
                      {p.status}
                    </span>
                    <p className="font-bold text-[#1A2332] mt-2">₹{p.fee}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unified Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-[#ECECEC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ECECEC] bg-[#FDF8F8] flex items-center gap-2">
          <Calendar size={18} className="text-[#800020] opacity-70" />
          <h3 className="font-bold text-[#800020] text-[16px]">Unified Patient Timeline</h3>
        </div>
        <div className="p-6 bg-[#FDF8F8]/50">
          <PatientTimeline record={record} />
        </div>
      </div>

    </div>
  );
}
