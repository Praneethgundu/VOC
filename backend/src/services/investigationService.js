const { getWorkbook } = require("./excelService");
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

const getInvestigationSheet = async () => {
  const { workbook, filePath } = await getWorkbook("investigations_v2.xlsx", "Investigations", columns);
  let sheet = workbook.getWorksheet("Investigations");
  if (!sheet) {
    sheet = workbook.addWorksheet("Investigations");
    sheet.columns = columns;
    
    // Seed dummy data
    const dummyData = [
      { opNumber: "OP-2024-001", patientName: "Ravi Kumar Sharma", testName: "X-Ray Knee AP/Lat", doctor: "Dr. Meera Patel", amount: 400, status: "COMPLETED", result: "Normal", orderedDate: new Date(new Date().setHours(10, 30, 0)).toISOString() },
      { opNumber: "OP-2024-001", patientName: "Ravi Kumar Sharma", testName: "Serum Uric Acid", doctor: "Dr. Meera Patel", amount: 200, status: "COMPLETED", result: "7.2 mg/dL", orderedDate: new Date(new Date().setHours(10, 31, 0)).toISOString() },
      { opNumber: "OP-2024-002", patientName: "Lakshmi Devi Nellore", testName: "DEXA Bone Density Scan", doctor: "Dr. Ramesh Kumar", amount: 1500, status: "IN PROGRESS", result: "", orderedDate: new Date(new Date().setHours(11, 15, 0)).toISOString() },
      { opNumber: "OP-2024-003", patientName: "Suresh Babu Reddy", testName: "MRI Lumbar Spine", doctor: "Dr. Anil Reddy", amount: 4000, status: "COMPLETED", result: "Normal", orderedDate: new Date(new Date().setHours(12, 0, 0)).toISOString() }
    ];
    dummyData.forEach(data => sheet.addRow({ id: crypto.randomBytes(4).toString("hex"), ...data }));

    await workbook.xlsx.writeFile(filePath);
  }
  return { workbook, sheet, filePath };
};

const addInvestigation = async (data) => {
  const { workbook, sheet, filePath } = await getInvestigationSheet();
  
  const id = crypto.randomBytes(4).toString("hex");
  const newInvestigation = {
    id,
    opNumber: data.opNumber,
    patientName: data.patientName,
    doctor: data.doctor,
    testName: data.testName,
    amount: data.amount,
    status: data.status || "Pending",
    result: "",
    orderedDate: new Date().toISOString(),
  };
  
  sheet.addRow(newInvestigation);
  await workbook.xlsx.writeFile(filePath);
  return newInvestigation;
};

const getInvestigations = async () => {
  const { sheet } = await getInvestigationSheet();
  const investigations = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    investigations.push({
      id: row.getCell(1).value,
      opNumber: row.getCell(2).value,
      patientName: row.getCell(3).value,
      doctor: row.getCell(4).value,
      testName: row.getCell(5).value,
      amount: row.getCell(6).value,
      status: row.getCell(7).value,
      result: row.getCell(8).value,
      orderedDate: row.getCell(9).value,
    });
  });
  
  return investigations.reverse();
};

const updateInvestigationStatus = async (id, status, result = "") => {
  const { workbook, sheet, filePath } = await getInvestigationSheet();
  let updated = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      if (status) row.getCell(7).value = status;
      if (result) row.getCell(8).value = result;
      updated = true;
    }
  });

  if (updated) {
    await workbook.xlsx.writeFile(filePath);
  }
  return updated;
};

module.exports = {
  getInvestigationSheet,
  addInvestigation,
  getInvestigations,
  updateInvestigationStatus,
};