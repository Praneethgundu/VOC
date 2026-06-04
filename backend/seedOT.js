const ExcelJS = require("exceljs");
const path = require("path");
const crypto = require("crypto");

const columns = [
  { header: "Procedure ID", key: "id", width: 20 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Patient Name", key: "patientName", width: 25 },
  { header: "Age", key: "age", width: 10 },
  { header: "Procedure", key: "procedure", width: 30 },
  { header: "Doctor", key: "doctor", width: 25 },
  { header: "Date", key: "date", width: 15 },
  { header: "Time", key: "time", width: 15 },
  { header: "Fee", key: "fee", width: 15 },
  { header: "Notes", key: "notes", width: 40 },
  { header: "Status", key: "status", width: 15 },
];

const dummyData = [
  {
    opNumber: "OP-2024-001",
    patientName: "Ravi Kumar Sharma",
    age: "45",
    procedure: "Joint Aspiration",
    doctor: "Dr. Meera Patel",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    fee: "1200",
    notes: "Right knee aspiration, fluid sent for analysis",
    status: "COMPLETED",
  },
  {
    opNumber: "OP-2024-004",
    patientName: "Padmavathi Venkatesh",
    age: "27",
    procedure: "Casting / Splinting",
    doctor: "Dr. Sunitha Devi",
    date: new Date().toISOString().split("T")[0],
    time: "11:30",
    fee: "1500",
    notes: "Below knee cast applied for undisplaced fracture",
    status: "IN PROGRESS",
  }
];

async function seed() {
  const filePath = path.join(__dirname, "src/data/ot_procedures.xlsx");
  const workbook = new ExcelJS.Workbook();
  
  const sheet = workbook.addWorksheet("Procedures");
  sheet.columns = columns;

  dummyData.forEach(data => {
    sheet.addRow({
      id: "OT-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
      ...data
    });
  });

  await workbook.xlsx.writeFile(filePath);
  console.log("Seeded ot_procedures.xlsx successfully!");
}

seed().catch(console.error);
