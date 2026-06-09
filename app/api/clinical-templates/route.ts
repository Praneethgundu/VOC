import { NextResponse } from "next/server";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const templates = [
      {
        id: "temp_knee_oa",
        title: "Osteoarthritis Knee",
        complaint: "Chronic bilateral knee pain, difficulty walking, stiffness in mornings.",
        diagnosis: "Bilateral Osteoarthritis Knee (Grade II/III)",
        notes: "Advised physiotherapy, quadriceps strengthening, weight reduction. Avoid squatting and cross-legged sitting.",
        prescription: [
          { medicineName: "Tab. Paracetamol 650mg", dosage: "1-0-1", duration: "5 days" },
          { medicineName: "Tab. Glucosamine 1500mg", dosage: "0-1-0", duration: "30 days" },
        ],
      },
      {
        id: "temp_lumbar_spondylosis",
        title: "Lumbar Spondylosis",
        complaint: "Lower back pain radiating to bilateral buttocks, worse on prolonged standing.",
        diagnosis: "Lumbar Spondylosis with Mild Canal Stenosis",
        notes: "Lumbar traction advised. Avoid bending forward and lifting heavy weights. Lumbar belt during travel.",
        prescription: [
          { medicineName: "Tab. Pregabalin 75mg", dosage: "0-0-1", duration: "10 days" },
          { medicineName: "Cap. Pantoprazole 40mg", dosage: "1-0-0", duration: "10 days" },
        ],
      },
      {
        id: "temp_ankle_sprain",
        title: "Ankle Sprain (RICE protocol)",
        complaint: "Swelling and pain in right ankle following inversion injury while playing.",
        diagnosis: "Right Ankle Lateral Ligament Sprain (Grade I/II)",
        notes: "RICE Protocol (Rest, Ice, Compression, Elevation) for 48 hours. Crepe bandage applied. Avoid weight bearing.",
        prescription: [
          { medicineName: "Tab. Aceclofenac 100mg + Serratiopeptidase", dosage: "1-0-1", duration: "3 days" },
        ],
      }
    ];

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch templates", error: error.message }, { status: 500 });
  }
}
