const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const { getHospitalWorkbook, saveHospitalWorkbook, releaseLock } = require("../services/excelService");
const investigationMasterService = require("../services/investigationMasterService");

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

const runMigration = async () => {
  console.log("Starting Migration to hospital_data.xlsx...");
  try {
    const workbook = await getHospitalWorkbook();
    
    // 1. Create all sheets if they don't exist
    for (const [sheetName, cols] of Object.entries(schema)) {
      let sheet = workbook.getWorksheet(sheetName);
      if (!sheet) {
        sheet = workbook.addWorksheet(sheetName);
        console.log(`Created sheet: ${sheetName}`);
      }
      sheet.columns = cols;
    }

    // Helper to migrate from an old file to a specific sheet
    const migrateFromFile = async (oldFileName, sheetName) => {
      let oldFilePath = oldFileName;
      if (!path.isAbsolute(oldFileName)) {
        oldFilePath = path.join(__dirname, "../data", oldFileName);
      }
      if (!fs.existsSync(oldFilePath)) {
        console.log(`Old file ${oldFileName} not found, skipping migration for ${sheetName}`);
        return;
      }

      console.log(`Migrating data from ${oldFileName} to ${sheetName}...`);
      const oldWb = new ExcelJS.Workbook();
      await oldWb.xlsx.readFile(oldFilePath);
      const oldSheet = oldWb.worksheets[0];
      const newSheet = workbook.getWorksheet(sheetName);

      if (oldSheet && newSheet) {
        // Clear existing rows (keep header)
        newSheet.spliceRows(2, newSheet.rowCount);

        let count = 0;
        oldSheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header
          // Some files might have different schema length, so we try to map directly by cell index
          const newRow = {};
          newSheet.columns.forEach((col, index) => {
            newRow[col.key] = row.getCell(index + 1).value;
          });
          newSheet.addRow(newRow);
          count++;
        });
        console.log(`Migrated ${count} records to ${sheetName}.`);
      }
    };

    // 2. Migrate data from old files
    await migrateFromFile("users.xlsx", "Users");
    await migrateFromFile("patients.xlsx", "Patients");
    await migrateFromFile("consultations.xlsx", "Consultations");
    await migrateFromFile(path.join(__dirname, "../../../Investigation.xlsx"), "Investigation_Master");
    await migrateFromFile("investigation_transactions.xlsx", "Investigation_Transactions");
    await migrateFromFile("inventory.xlsx", "Inventory");
    await migrateFromFile("pharmacy.xlsx", "Pharmacy");
    await migrateFromFile("billing.xlsx", "Bills");
    await migrateFromFile("ot_procedures.xlsx", "OT_Procedures");

    console.log("Saving hospital_data.xlsx...");
    await saveHospitalWorkbook(workbook);
    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Migration failed:", error);
    releaseLock();
  }
};

runMigration();
