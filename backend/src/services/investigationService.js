const { getHospitalWorkbook, saveHospitalWorkbook, releaseLock } = require("./excelService");
const crypto = require("crypto");

const columns = [
  { header: "Investigation ID", key: "id", width: 15 },
  { header: "Patient ID", key: "patientId", width: 36 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Investigation Name", key: "testName", width: 25 },
  { header: "Doctor", key: "doctor", width: 25 },
  { header: "Cost", key: "amount", width: 15 },
  { header: "Status", key: "status", width: 15 },
  { header: "Result", key: "result", width: 40 },
  { header: "Investigation Date", key: "orderedDate", width: 25 },
];

const getInvestigationSheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Investigation_Transactions");
  return { workbook, sheet };
};

const addInvestigation = async (data) => {
  const { workbook, sheet } = await getInvestigationSheet();

  const id = crypto.randomBytes(4).toString("hex");
  const newInvestigation = {
    id,
    patientId: data.patientId || "",
    opNumber: data.opNumber,
    testName: data.testName,
    doctor: data.doctor,
    amount: data.amount,
    status: data.status || "Pending",
    result: "",
    orderedDate: new Date().toISOString(),
  };

  sheet.addRow(newInvestigation);
  await saveHospitalWorkbook(workbook);
  
  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Investigation Ordered", `ID: ${id}`);
  
  return newInvestigation;
};

const getInvestigations = async () => {
  const { sheet } = await getInvestigationSheet();
  const investigations = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    investigations.push({
      id: row.getCell(1).value,
      patientId: row.getCell(2).value,
      opNumber: row.getCell(3).value,
      testName: row.getCell(4).value,
      doctor: row.getCell(5).value,
      amount: row.getCell(6).value,
      status: row.getCell(7).value,
      result: row.getCell(8).value,
      orderedDate: row.getCell(9).value,
    });
  });

  releaseLock();
  return investigations.reverse();
};

const updateInvestigation = async (id, updateData) => {
  const { workbook, sheet } = await getInvestigationSheet();
  let updated = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      if (updateData.testName !== undefined)
        row.getCell(4).value = updateData.testName;
      if (updateData.amount !== undefined)
        row.getCell(6).value = updateData.amount;
      if (updateData.status !== undefined)
        row.getCell(7).value = updateData.status;
      if (updateData.result !== undefined)
        row.getCell(8).value = updateData.result;

      updated = {
        id,
        patientId: row.getCell(2).value,
        opNumber: row.getCell(3).value,
        testName: row.getCell(4).value,
        doctor: row.getCell(5).value,
        amount: row.getCell(6).value,
        status: row.getCell(7).value,
        result: row.getCell(8).value,
        orderedDate: row.getCell(9).value,
      };
    }
  });

  if (updated) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return updated;
};

const deleteInvestigation = async (id) => {
  const { workbook, sheet } = await getInvestigationSheet();
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
  getInvestigationSheet,
  addInvestigation,
  getInvestigations,
  updateInvestigation,
  updateInvestigationStatus: updateInvestigation,
  deleteInvestigation,
};
