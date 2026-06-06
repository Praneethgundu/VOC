const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

class Mutex {
  constructor() {
    this.locked = false;
    this.queue = [];
  }
  
  async acquire() {
    if (!this.locked) {
      this.locked = true;
      return;
    }
    return new Promise(resolve => this.queue.push(resolve));
  }
  
  release() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.locked = false;
    }
  }
}

const excelMutex = new Mutex();
const hospitalDataPath = path.join(__dirname, "../data", "hospital-data.xlsx");

const schema = {
  "Users": [
    { header: "User ID", key: "id", width: 15 },
    { header: "Username", key: "username", width: 20 },
    { header: "Password Hash", key: "password", width: 50 },
    { header: "Role", key: "role", width: 15 },
    { header: "Created At", key: "createdAt", width: 25 },
  ],
  "Patients": [
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Name", key: "fullName", width: 25 },
    { header: "Age", key: "age", width: 10 },
    { header: "Gender", key: "gender", width: 15 },
    { header: "Phone Number", key: "phone", width: 20 },
    { header: "Blood Group", key: "bloodGroup", width: 15 },
    { header: "Department", key: "department", width: 20 },
    { header: "Consulting Doctor", key: "doctor", width: 20 },
    { header: "Patient Complaint", key: "complaint", width: 25 },
    { header: "Address", key: "address", width: 30 },
    { header: "Registration Date", key: "createdAt", width: 25 },
    { header: "Status", key: "status", width: 15 },
  ],
  "Consultations": [
    { header: "Consultation ID", key: "id", width: 20 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Doctor", key: "doctor", width: 25 },
    { header: "Department", key: "department", width: 20 },
    { header: "Diagnosis", key: "diagnosis", width: 30 },
    { header: "Clinical Notes", key: "notes", width: 40 },
    { header: "Prescription", key: "prescription", width: 40 },
    { header: "Follow-Up Date", key: "followUpDate", width: 15 },
    { header: "Consultation Date", key: "consultationDate", width: 25 },
    { header: "Status", key: "status", width: 15 },
  ],
  "Investigation_Master": [
    { header: "Investigation Code", key: "code", width: 20 },
    { header: "Investigation Name", key: "name", width: 35 },
    { header: "Description", key: "description", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "Type", key: "type", width: 15 },
    { header: "Price", key: "price", width: 15 },
  ],
  "Investigation_Transactions": [
    { header: "Transaction ID", key: "id", width: 20 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Investigation Name", key: "testName", width: 30 },
    { header: "Investigation Amount", key: "amount", width: 15 },
    { header: "Ordered By", key: "doctor", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Result", key: "result", width: 30 },
    { header: "Date", key: "orderedDate", width: 25 },
  ],
  "Inventory": [
    { header: "Medicine ID", key: "medicineId", width: 20 },
    { header: "Medicine Name", key: "medicineName", width: 30 },
    { header: "Batch", key: "batch", width: 15 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Price", key: "price", width: 10 },
    { header: "Expiry Date", key: "expiryDate", width: 15 },
    { header: "Category", key: "category", width: 20 },
    { header: "Created At", key: "createdAt", width: 25 },
  ],
  "Pharmacy": [
    { header: "Dispense ID", key: "id", width: 20 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Bill ID", key: "billId", width: 20 },
    { header: "Medicine Name", key: "medicineName", width: 30 },
    { header: "Batch", key: "batch", width: 15 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Price", key: "price", width: 10 },
    { header: "Total Amount", key: "amount", width: 15 },
    { header: "Dispensed By", key: "dispensedBy", width: 20 },
    { header: "Date", key: "dispensedDate", width: 25 },
  ],
  "Bills": [
    { header: "Bill ID", key: "billNumber", width: 20 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Bill Items", key: "items", width: 50 },
    { header: "Consultation Charges", key: "consultationCharges", width: 20 },
    { header: "Investigation Charges", key: "investigationCharges", width: 20 },
    { header: "Medicine Charges", key: "medicineCharges", width: 20 },
    { header: "OT Charges", key: "otCharges", width: 20 },
    { header: "Total Amount", key: "total", width: 15 },
    { header: "Paid Amount", key: "paidAmount", width: 15 },
    { header: "Pending Amount", key: "pendingAmount", width: 15 },
    { header: "Payment Mode", key: "paymentMode", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Created Date", key: "date", width: 25 },
  ],
  "OT_Procedures": [
    { header: "Procedure ID", key: "id", width: 20 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Doctor", key: "doctor", width: 25 },
    { header: "Procedure Name", key: "procedureName", width: 30 },
    { header: "Cost", key: "cost", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Procedure Date", key: "date", width: 25 },
    { header: "Notes", key: "notes", width: 40 },
  ],
  "Audit_Log": [
    { header: "Timestamp", key: "timestamp", width: 25 },
    { header: "User", key: "user", width: 20 },
    { header: "Role", key: "role", width: 15 },
    { header: "Module", key: "module", width: 20 },
    { header: "Action", key: "action", width: 30 },
    { header: "Record ID", key: "recordId", width: 40 },
  ],
};

const getHospitalWorkbook = async () => {
  await excelMutex.acquire();
  const workbook = new ExcelJS.Workbook();
  try {
    if (fs.existsSync(hospitalDataPath)) {
      await workbook.xlsx.readFile(hospitalDataPath);
    }
  } catch (error) {
    console.error("Error reading hospital_data.xlsx:", error);
  }

  // Enforce schema to preserve keys so addRow(object) works properly
  for (const [sheetName, cols] of Object.entries(schema)) {
    let sheet = workbook.getWorksheet(sheetName);
    if (!sheet) {
      sheet = workbook.addWorksheet(sheetName);
    }
    sheet.columns = cols;
  }

  return workbook;
};

const saveHospitalWorkbook = async (workbook) => {
  try {
    console.log("[EXCEL WRITE STARTED]");
    console.log("Writing to file:", hospitalDataPath);

    // Let's count rows in the 'Patients' sheet before writing to verify
    const patientsSheetBefore = workbook.getWorksheet("Patients");
    const rowsBefore = patientsSheetBefore ? patientsSheetBefore.rowCount : 0;
    console.log("Rows Before (in memory):", rowsBefore);

    await workbook.xlsx.writeFile(hospitalDataPath);
    console.log("[EXCEL WRITE SUCCESS]");

    // Immediate post-save validation by re-reading the file
    const validationWb = new ExcelJS.Workbook();
    await validationWb.xlsx.readFile(hospitalDataPath);
    const patientsSheetAfter = validationWb.getWorksheet("Patients");
    const rowsAfter = patientsSheetAfter ? patientsSheetAfter.rowCount : 0;
    console.log("Rows After (on disk):", rowsAfter);

    if (rowsAfter !== rowsBefore && rowsBefore !== 0) {
       console.log("WARNING: Row count mismatch after save!");
    }
  } catch (error) {
    console.error("[EXCEL WRITE FAILED]", error);
    throw error;
  } finally {
    excelMutex.release();
  }
};

const releaseLock = () => {
  excelMutex.release();
}

module.exports = {
  getHospitalWorkbook,
  saveHospitalWorkbook,
  releaseLock
};