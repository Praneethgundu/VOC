const ExcelJS = require("exceljs");
const path = require("path");
const crypto = require("crypto");

const columns = [
  { header: "ID", key: "id", width: 15 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Patient Name", key: "patientName", width: 25 },
  { header: "Doctor", key: "doctor", width: 25 },
  { header: "Test Name", key: "testName", width: 25 },
  { header: "Amount", key: "amount", width: 15 },
  { header: "Status", key: "status", width: 15 },
  { header: "Result", key: "result", width: 40 },
  { header: "Ordered Date", key: "orderedDate", width: 25 },
];

const dummyData = [
  {
    opNumber: "OP-2024-001",
    patientName: "Ravi Kumar Sharma",
    testName: "X-Ray Knee AP/Lat",
    doctor: "Dr. Meera Patel",
    amount: 400,
    status: "COMPLETED",
    result: "Normal",
    orderedDate: new Date(new Date().setHours(10, 30, 0)).toISOString()
  },
  {
    opNumber: "OP-2024-001",
    patientName: "Ravi Kumar Sharma",
    testName: "Serum Uric Acid",
    doctor: "Dr. Meera Patel",
    amount: 200,
    status: "COMPLETED",
    result: "7.2 mg/dL",
    orderedDate: new Date(new Date().setHours(10, 31, 0)).toISOString()
  },
  {
    opNumber: "OP-2024-002",
    patientName: "Lakshmi Devi Nellore",
    testName: "DEXA Bone Density Scan",
    doctor: "Dr. Ramesh Kumar",
    amount: 1500,
    status: "IN PROGRESS",
    result: "",
    orderedDate: new Date(new Date().setHours(11, 15, 0)).toISOString()
  },
  {
    opNumber: "OP-2024-003",
    patientName: "Suresh Babu Reddy",
    testName: "MRI Lumbar Spine",
    doctor: "Dr. Anil Reddy",
    amount: 4000,
    status: "COMPLETED",
    result: "Normal",
    orderedDate: new Date(new Date().setHours(12, 0, 0)).toISOString()
  }
];

async function seed() {
  const filePath = path.join(__dirname, "src/data/investigations.xlsx");
  const workbook = new ExcelJS.Workbook();
  
  // Overwrite completely
  const sheet = workbook.addWorksheet("Investigations");
  sheet.columns = columns;

  dummyData.forEach(data => {
    sheet.addRow({
      id: crypto.randomBytes(4).toString("hex"),
      ...data
    });
  });

  await workbook.xlsx.writeFile(filePath);
  console.log("Seeded investigations.xlsx successfully with dummy data!");
}

seed().catch(console.error);
