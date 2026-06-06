const { getHospitalWorkbook, saveHospitalWorkbook, releaseLock } = require("./excelService");
const crypto = require("crypto");

const columns = [
  { header: "Procedure ID", key: "id", width: 20 },
  { header: "Patient ID", key: "patientId", width: 36 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Doctor", key: "doctor", width: 25 },
  { header: "Procedure Name", key: "procedure", width: 30 },
  { header: "Cost", key: "fee", width: 15 },
  { header: "Status", key: "status", width: 15 },
  { header: "Procedure Date", key: "date", width: 25 },
  { header: "Notes", key: "notes", width: 40 },
];

const getOTSheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("OT_Procedures");
  return { workbook, sheet };
};

const scheduleProcedure = async (data) => {
  const { workbook, sheet } = await getOTSheet();
  
  const id = "OT-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const newProcedure = {
    id,
    patientId: data.patientId || "",
    opNumber: data.opNumber,
    doctor: data.doctor,
    procedure: data.procedure,
    fee: data.fee,
    status: data.status || "Scheduled",
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    notes: data.notes || "",
  };
  
  sheet.addRow(newProcedure);
  await saveHospitalWorkbook(workbook);
  
  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Procedure Scheduled", `ID: ${id}`);
  
  return newProcedure;
};

const getProcedures = async () => {
  const { sheet } = await getOTSheet();
  const procedures = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    procedures.push({
      id: row.getCell(1).value,
      patientId: row.getCell(2).value,
      opNumber: row.getCell(3).value,
      doctor: row.getCell(4).value,
      procedure: row.getCell(5).value,
      fee: row.getCell(6).value,
      status: row.getCell(7).value,
      date: row.getCell(8).value,
      notes: row.getCell(9).value,
    });
  });
  
  releaseLock();
  return procedures.reverse();
};

const updateProcedure = async (id, updateData) => {
  const { workbook, sheet } = await getOTSheet();
  let updated = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      if (updateData.doctor) row.getCell(4).value = updateData.doctor;
      if (updateData.procedure) row.getCell(5).value = updateData.procedure;
      if (updateData.fee) row.getCell(6).value = updateData.fee;
      if (updateData.status) row.getCell(7).value = updateData.status;
      if (updateData.date) row.getCell(8).value = updateData.date;
      if (updateData.notes) row.getCell(9).value = updateData.notes;
      
      updated = {
        id,
        patientId: row.getCell(2).value,
        opNumber: row.getCell(3).value,
        doctor: row.getCell(4).value,
        procedure: row.getCell(5).value,
        fee: row.getCell(6).value,
        status: row.getCell(7).value,
        date: row.getCell(8).value,
        notes: row.getCell(9).value,
      };
    }
  });

  if (updated) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return updated;
};

const deleteProcedure = async (id) => {
  const { workbook, sheet } = await getOTSheet();
  let deleted = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      sheet.spliceRows(rowNumber, 1);
      deleted = true;
    }
  });

  if (deleted) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return deleted;
};

module.exports = {
  scheduleProcedure,
  getProcedures,
  updateProcedure,
  deleteProcedure,
};
