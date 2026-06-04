const { getWorkbook } = require("./excelService");

const columns = [
  { header: "ID", key: "id", width: 36 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Patient Name", key: "patientName", width: 25 },
  { header: "Doctor", key: "doctor", width: 25 },
  { header: "Diagnosis", key: "diagnosis", width: 40 },
  { header: "Prescription", key: "prescription", width: 40 },
  { header: "Status", key: "status", width: 20 },
  { header: "Consultation Date", key: "consultationDate", width: 25 },
];

const getConsultationSheet = async () => {
  const { workbook, filePath } = await getWorkbook("consultations.xlsx", "Consultations", columns);
  const sheet = workbook.getWorksheet("Consultations");
  return { workbook, sheet, filePath };
};

const addConsultation = async (data) => {
  const { workbook, sheet, filePath } = await getConsultationSheet();
  
  const id = require("crypto").randomUUID();
  const newConsultation = {
    id,
    opNumber: data.opNumber,
    patientName: data.patientName,
    doctor: data.doctor,
    diagnosis: data.diagnosis || "",
    prescription: data.prescription || "",
    status: data.status || "Waiting",
    consultationDate: new Date().toISOString(),
  };
  
  sheet.addRow(newConsultation);
  await workbook.xlsx.writeFile(filePath);
  return newConsultation;
};

const updateConsultationStatus = async (id, status) => {
  const { workbook, sheet, filePath } = await getConsultationSheet();
  
  let updated = null;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      row.getCell(7).value = status;
      updated = {
        id: row.getCell(1).value,
        opNumber: row.getCell(2).value,
        status: row.getCell(7).value,
      };
    }
  });

  if (updated) {
    await workbook.xlsx.writeFile(filePath);
  }
  return updated;
};

const getConsultations = async () => {
  const { sheet } = await getConsultationSheet();
  const consultations = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    consultations.push({
      id: row.getCell(1).value,
      opNumber: row.getCell(2).value,
      patientName: row.getCell(3).value,
      doctor: row.getCell(4).value,
      diagnosis: row.getCell(5).value,
      prescription: row.getCell(6).value,
      status: row.getCell(7).value,
      consultationDate: row.getCell(8).value,
    });
  });
  
  return consultations.reverse(); // Newest first
};

module.exports = {
  getConsultationSheet,
  addConsultation,
  getConsultations,
  updateConsultationStatus,
};