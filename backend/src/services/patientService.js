const {
  getHospitalWorkbook, saveHospitalWorkbook, releaseLock
} = require("./excelService");
const consultationService = require("./consultationService");
const investigationService = require("./investigationService");
const billingService = require("./billingService");
const otService = require("./otService");
const pharmacyService = require("./pharmacyService");

const columns = [
  { header: "Patient ID", key: "patientId", width: 20 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Name", key: "fullName", width: 25 },
  { header: "Age", key: "age", width: 10 },
  { header: "Gender", key: "gender", width: 15 },
  { header: "Phone Number", key: "phone", width: 20 },
  { header: "Blood Group", key: "bloodGroup", width: 15 },
  { header: "Department", key: "department", width: 20 },
  { header: "Consulting Doctor", key: "doctor", width: 20 },
  { header: "Address", key: "address", width: 30 },
  { header: "Registration Date", key: "createdAt", width: 25 },
  { header: "Status", key: "status", width: 15 },
];

const getPatientSheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Patients");
  return { workbook, sheet };
};

const createPatient = async (patientData) => {
  const { workbook, sheet, filePath } = await getPatientSheet();
  
  const opNumber = patientData.opNumber || `OP/${new Date().getFullYear()}/${String(sheet.rowCount > 1 ? sheet.rowCount : 1).padStart(3, '0')}`;
  
  const patientId = require("crypto").randomUUID();

  const newPatient = {
    patientId,
    opNumber,
    fullName: patientData.fullName,
    age: patientData.age,
    gender: patientData.gender,
    phone: patientData.phone,
    bloodGroup: patientData.bloodGroup,
    department: patientData.department,
    doctor: patientData.doctor,
    complaint: patientData.complaint || "",
    address: patientData.address,
    createdAt: new Date().toISOString(),
    status: patientData.status || "Active",
  };
  
  sheet.addRow(newPatient);
  await saveHospitalWorkbook(workbook);
  
  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Patient Created", `OP: ${opNumber}`);
  
  return newPatient;
};

const getAllPatients = async () => {
  const { sheet } = await getPatientSheet();
  const patients = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    patients.push({
      patientId: row.getCell(1).value,
      opNumber: row.getCell(2).value,
      fullName: row.getCell(3).value,
      age: row.getCell(4).value,
      gender: row.getCell(5).value,
      phone: row.getCell(6).value,
      bloodGroup: row.getCell(7).value,
      department: row.getCell(8).value,
      doctor: row.getCell(9).value,
      complaint: row.getCell(10).value,
      address: row.getCell(11).value,
      createdAt: row.getCell(12).value,
      status: row.getCell(13).value,
    });
  });
  
  releaseLock();
  return patients.reverse(); // Newest first
};

const updatePatient = async (opNumber, updateData) => {
  const { workbook, sheet } = await getPatientSheet();
  let updated = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(2).value === opNumber) { // cell 2 is opNumber
      if (updateData.fullName) row.getCell(3).value = updateData.fullName;
      if (updateData.age) row.getCell(4).value = updateData.age;
      if (updateData.gender) row.getCell(5).value = updateData.gender;
      if (updateData.phone) row.getCell(6).value = updateData.phone;
      if (updateData.bloodGroup) row.getCell(7).value = updateData.bloodGroup;
      if (updateData.department) row.getCell(8).value = updateData.department;
      if (updateData.doctor) row.getCell(9).value = updateData.doctor;
      if (updateData.complaint) row.getCell(10).value = updateData.complaint;
      if (updateData.address) row.getCell(11).value = updateData.address;
      if (updateData.status) row.getCell(13).value = updateData.status;

      updated = {
        patientId: row.getCell(1).value,
        opNumber,
        fullName: row.getCell(3).value,
        age: row.getCell(4).value,
        gender: row.getCell(5).value,
        phone: row.getCell(6).value,
        bloodGroup: row.getCell(7).value,
        department: row.getCell(8).value,
        doctor: row.getCell(9).value,
        complaint: row.getCell(10).value,
        address: row.getCell(11).value,
        createdAt: row.getCell(12).value,
        status: row.getCell(13).value,
      };
    }
  });

  if (updated) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return updated;
};

const deletePatient = async (opNumber) => {
  const { workbook, sheet } = await getPatientSheet();
  let deleted = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(2).value === opNumber) {
      sheet.spliceRows(rowNumber, 1);
      deleted = true;
    }
  });

  if (deleted) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return deleted;
};

const getPatientRecord = async (opNumber) => {
  const allPatients = await getAllPatients();
  const profile = allPatients.find(p => p.opNumber === opNumber);
  if (!profile) return null;

  const [
    allConsultations,
    allInvestigations,
    allBills,
    allProcedures,
    allDispensed,
    inventory
  ] = await Promise.all([
    consultationService.getConsultations(),
    investigationService.getInvestigations(),
    billingService.getBills(),
    otService.getProcedures(),
    pharmacyService.getDispenseHistory(),
    pharmacyService.getInventory()
  ]);

  const consultations = allConsultations.filter(c => c.opNumber === opNumber);
  const investigations = allInvestigations.filter(i => i.opNumber === opNumber);
  const bills = allBills.filter(b => b.opNumber === opNumber);
  const procedures = allProcedures.filter(p => p.opNumber === opNumber);
  
  const pharmacy = allDispensed
    .filter(d => d.opNumber === opNumber)
    .map(d => {
      const med = inventory.find(i => i.medicineId === d.medicineId);
      return {
        ...d,
        medicineName: med ? med.medicineName : d.medicineId
      };
    });

  return {
    profile,
    consultations,
    investigations,
    bills,
    procedures,
    pharmacy,
  };
};

module.exports = {
  getPatientSheet,
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  getPatientRecord
};