const { getWorkbook } = require("./excelService");
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

const getOTSheet = async () => {
  const { workbook, filePath } = await getWorkbook("ot_procedures_v2.xlsx", "Procedures", columns);
  let sheet = workbook.getWorksheet("Procedures");
  if (!sheet) {
    sheet = workbook.addWorksheet("Procedures");
    sheet.columns = columns;

    // Seed dummy data
    const dummyData = [
      { opNumber: "OP-2024-001", patientName: "Ravi Kumar Sharma", age: "45", procedure: "Joint Aspiration", doctor: "Dr. Meera Patel", date: new Date().toISOString().split("T")[0], time: "10:00", fee: "1200", notes: "Right knee aspiration, fluid sent for analysis", status: "COMPLETED" },
      { opNumber: "OP-2024-004", patientName: "Padmavathi Venkatesh", age: "27", procedure: "Casting / Splinting", doctor: "Dr. Sunitha Devi", date: new Date().toISOString().split("T")[0], time: "11:30", fee: "1500", notes: "Below knee cast applied for undisplaced fracture", status: "IN PROGRESS" }
    ];
    dummyData.forEach(data => sheet.addRow({ id: "OT-" + crypto.randomBytes(3).toString("hex").toUpperCase(), ...data }));

    await workbook.xlsx.writeFile(filePath);
  }
  return { workbook, sheet, filePath };
};

const scheduleProcedure = async (data) => {
  const { workbook, sheet, filePath } = await getOTSheet();
  
  const id = "OT-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const newProcedure = {
    id,
    opNumber: data.opNumber,
    patientName: data.patientName,
    age: data.age,
    procedure: data.procedure,
    doctor: data.doctor,
    date: data.date,
    time: data.time,
    fee: data.fee,
    notes: data.notes,
    status: data.status || "Scheduled",
  };
  
  sheet.addRow(newProcedure);
  await workbook.xlsx.writeFile(filePath);
  return newProcedure;
};

const getProcedures = async () => {
  const { sheet } = await getOTSheet();
  const procedures = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    procedures.push({
      id: row.getCell(1).value,
      opNumber: row.getCell(2).value,
      patientName: row.getCell(3).value,
      age: row.getCell(4).value,
      procedure: row.getCell(5).value,
      doctor: row.getCell(6).value,
      date: row.getCell(7).value,
      time: row.getCell(8).value,
      fee: row.getCell(9).value,
      notes: row.getCell(10).value,
      status: row.getCell(11).value,
    });
  });
  
  return procedures.reverse();
};

const updateProcedureStatus = async (id, status) => {
  const { workbook, sheet, filePath } = await getOTSheet();
  let updated = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      row.getCell(11).value = status;
      updated = true;
    }
  });

  if (updated) {
    await workbook.xlsx.writeFile(filePath);
  }
  return updated;
};

module.exports = {
  scheduleProcedure,
  getProcedures,
  updateProcedureStatus,
};
