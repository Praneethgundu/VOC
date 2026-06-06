const { getHospitalWorkbook, saveHospitalWorkbook, releaseLock } = require("./excelService");

const columns = [
  { header: "Consultation ID", key: "id", width: 36 },
  { header: "Patient ID", key: "patientId", width: 36 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Doctor", key: "doctor", width: 25 },
  { header: "Department", key: "department", width: 20 },
  { header: "Diagnosis", key: "diagnosis", width: 40 },
  { header: "Clinical Notes", key: "clinicalNotes", width: 50 },
  { header: "Prescription", key: "prescription", width: 40 },
  { header: "Follow-Up Date", key: "followUpDate", width: 20 },
  { header: "Consultation Date", key: "consultationDate", width: 25 },
  { header: "Status", key: "status", width: 20 },
];

const getConsultationSheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Consultations");
  return { workbook, sheet };
};

const addConsultation = async (data) => {
  const { workbook, sheet, filePath } = await getConsultationSheet();
  
  const id = require("crypto").randomUUID();
  const newConsultation = {
    id,
    patientId: data.patientId || "",
    opNumber: data.opNumber,
    doctor: data.doctor,
    department: data.department || "",
    diagnosis: data.diagnosis || "",
    clinicalNotes: data.clinicalNotes || "",
    prescription: data.prescription || "",
    followUpDate: data.followUpDate || "",
    consultationDate: new Date().toISOString(),
    status: data.status || "Waiting",
  };
  
  sheet.addRow(newConsultation);
  await saveHospitalWorkbook(workbook);
  
  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Consultation Created", `ID: ${id}`);
  
  return newConsultation;
};

const updateConsultationStatus = async (id, status) => {
  const { workbook, sheet } = await getConsultationSheet();
  
  let updated = null;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      row.getCell(11).value = status;
      updated = {
        id: row.getCell(1).value,
        opNumber: row.getCell(3).value,
        status: row.getCell(11).value,
      };
    }
  });

  if (updated) {
    await saveHospitalWorkbook(workbook);
  } else {
    releaseLock();
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
      patientId: row.getCell(2).value,
      opNumber: row.getCell(3).value,
      doctor: row.getCell(4).value,
      department: row.getCell(5).value,
      diagnosis: row.getCell(6).value,
      clinicalNotes: row.getCell(7).value,
      prescription: row.getCell(8).value,
      followUpDate: row.getCell(9).value,
      consultationDate: row.getCell(10).value,
      status: row.getCell(11).value,
    });
  });
  
  releaseLock();

  // Fetch patients to join complaint data
  const { getAllPatients } = require("./patientService");
  const patients = await getAllPatients();
  
  const enrichedConsultations = consultations.map(c => {
    const p = patients.find(pat => pat.opNumber === c.opNumber);
    return {
      ...c,
      patientName: p ? p.fullName : "Unknown Patient",
      complaint: p ? p.complaint : "N/A",
      age: p ? p.age : "",
      gender: p ? p.gender : "",
      bloodGroup: p ? p.bloodGroup : ""
    };
  });

  return enrichedConsultations.reverse(); // Newest first
};

const updateConsultation = async (id, updateData) => {
  const { workbook, sheet } = await getConsultationSheet();
  let updated = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      if (updateData.patientId) row.getCell(2).value = updateData.patientId;
      if (updateData.doctor) row.getCell(4).value = updateData.doctor;
      if (updateData.department) row.getCell(5).value = updateData.department;
      if (updateData.diagnosis) row.getCell(6).value = updateData.diagnosis;
      if (updateData.clinicalNotes) row.getCell(7).value = updateData.clinicalNotes;
      if (updateData.prescription) row.getCell(8).value = updateData.prescription;
      if (updateData.followUpDate) row.getCell(9).value = updateData.followUpDate;
      if (updateData.status) row.getCell(11).value = updateData.status;
      
      updated = {
        id,
        patientId: row.getCell(2).value,
        opNumber: row.getCell(3).value,
        doctor: row.getCell(4).value,
        department: row.getCell(5).value,
        diagnosis: row.getCell(6).value,
        clinicalNotes: row.getCell(7).value,
        prescription: row.getCell(8).value,
        followUpDate: row.getCell(9).value,
        consultationDate: row.getCell(10).value,
        status: row.getCell(11).value,
      };
    }
  });

  if (updated) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return updated;
};

const deleteConsultation = async (id) => {
  const { workbook, sheet } = await getConsultationSheet();
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
  getConsultationSheet,
  addConsultation,
  getConsultations,
  updateConsultationStatus,
  updateConsultation,
  deleteConsultation,
};