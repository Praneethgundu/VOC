const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

const excelFilePath = path.join(__dirname, "../../backend/src/data/hospital-data.xlsx");

// Robust date parser to prevent Prisma validation crashes
function safeDate(value) {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Robust number parser
function safeNum(value) {
  if (value === undefined || value === null) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

// Robust integer parser
function safeInt(value) {
  if (value === undefined || value === null) return 0;
  const n = parseInt(value, 10);
  return isNaN(n) ? 0 : n;
}

async function main() {
  console.log("Starting database migration from Excel to SQLite...");
  
  if (!fs.existsSync(excelFilePath)) {
    console.error(`Error: Excel file not found at ${excelFilePath}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(excelFilePath);
  
  // Helper to get array of JSON objects from a sheet
  const getSheetData = (sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.log(`Sheet "${sheetName}" not found in workbook.`);
      return [];
    }
    return XLSX.utils.sheet_to_json(sheet);
  };

  // 1. Migrate Users
  console.log("Migrating Users...");
  const usersData = getSheetData("Users");
  for (const row of usersData) {
    const username = row["Username"] || row["username"];
    if (!username) continue;
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: String(row["User ID"] || row["id"]),
          username,
          passwordHash: String(row["Password Hash"] || row["password"] || row["password_hash"] || ""),
          role: (row["Role"] || row["role"] || "RECEPTIONIST").toUpperCase(),
          isActive: row["Is Active"] !== undefined ? (row["Is Active"] === true || row["Is Active"] === 'true') : true,
          createdAt: safeDate(row["Created At"] || row["createdAt"]),
        }
      });
    }
  }
  console.log(`Migrated ${usersData.length} Users.`);

  // 2. Migrate Patients
  console.log("Migrating Patients...");
  const patientsData = getSheetData("Patients");
  for (const row of patientsData) {
    const opNumber = row["OP Number"] || row["opNumber"];
    if (!opNumber) continue;
    
    const patientId = String(row["Patient ID"] || row["patientId"]);

    // Check if patient already exists
    const existing = await prisma.patient.findUnique({ where: { opNumber } });
    if (!existing) {
      await prisma.patient.create({
        data: {
          patientId,
          opNumber,
          fullName: String(row["Name"] || row["fullName"] || ""),
          age: String(row["Age"] || row["age"] || ""),
          gender: String(row["Gender"] || row["gender"] || "Other"),
          phone: String(row["Phone Number"] || row["phone"] || ""),
          bloodGroup: String(row["Blood Group"] || row["bloodGroup"] || "Unknown"),
          department: String(row["Department"] || row["department"] || "General"),
          doctor: String(row["Consulting Doctor"] || row["doctor"] || ""),
          complaint: String(row["Patient Complaint"] || row["complaint"] || ""),
          address: String(row["Address"] || row["address"] || ""),
          status: String(row["Status"] || row["status"] || "Active"),
          createdAt: safeDate(row["Registration Date"] || row["createdAt"]),
        }
      });
    }
  }
  console.log(`Migrated ${patientsData.length} Patients.`);

  // 3. Migrate Consultations
  console.log("Migrating Consultations...");
  const consultationsData = getSheetData("Consultations");
  let consultationsCount = 0;
  for (const row of consultationsData) {
    const id = String(row["Consultation ID"] || row["id"]);
    const patientId = String(row["Patient ID"] || row["patientId"]);
    if (!id || !patientId) continue;
    
    // Ensure patient exists in DB to prevent foreign key errors
    const patientExists = await prisma.patient.findUnique({ where: { patientId } });
    if (!patientExists) {
      console.log(`Warning: Patient ${patientId} not found. Skipping consultation ${id}.`);
      continue;
    }

    const existing = await prisma.consultation.findUnique({ where: { id } });
    if (!existing) {
      await prisma.consultation.create({
        data: {
          id,
          patientId,
          opNumber: String(row["OP Number"] || row["opNumber"] || ""),
          doctor: String(row["Doctor"] || row["doctor"] || ""),
          department: String(row["Department"] || row["department"] || ""),
          diagnosis: String(row["Diagnosis"] || row["diagnosis"] || ""),
          notes: String(row["Clinical Notes"] || row["notes"] || ""),
          prescription: String(row["Prescription"] || row["prescription"] || "[]"),
          followUpDate: String(row["Follow-Up Date"] || row["followUpDate"] || ""),
          consultationDate: safeDate(row["Consultation Date"] || row["consultationDate"]),
          status: String(row["Status"] || row["status"] || "Waiting"),
        }
      });
      consultationsCount++;
    }
  }
  console.log(`Migrated ${consultationsCount} Consultations.`);

  // 4. Migrate Investigation Master
  console.log("Migrating Investigation Master...");
  const invMasterData = getSheetData("Investigation_Master");
  for (const row of invMasterData) {
    const code = row["Investigation Code"] || row["code"];
    if (!code) continue;
    
    const existing = await prisma.investigationMaster.findUnique({ where: { code } });
    if (!existing) {
      await prisma.investigationMaster.create({
        data: {
          code,
          name: String(row["Investigation Name"] || row["name"] || ""),
          description: String(row["Description"] || row["description"] || ""),
          category: String(row["Category"] || row["category"] || ""),
          type: String(row["Type"] || row["type"] || "Investigation"),
          price: safeNum(row["Price"] || row["price"]),
        }
      });
    }
  }
  console.log(`Migrated ${invMasterData.length} Investigation Master items.`);

  // 5. Migrate Investigation Transactions
  console.log("Migrating Investigation Transactions...");
  const invTxData = getSheetData("Investigation_Transactions");
  let invTxCount = 0;
  for (const row of invTxData) {
    const id = String(row["Transaction ID"] || row["id"]);
    if (!id) continue;
    
    const existing = await prisma.investigationTransaction.findUnique({ where: { id } });
    if (!existing) {
      await prisma.investigationTransaction.create({
        data: {
          id,
          patientId: String(row["Patient ID"] || row["patientId"] || ""),
          opNumber: String(row["OP Number"] || row["opNumber"] || ""),
          testName: String(row["Investigation Name"] || row["testName"] || ""),
          amount: safeNum(row["Investigation Amount"] || row["amount"]),
          doctor: String(row["Ordered By"] || row["doctor"] || ""),
          status: String(row["Status"] || row["status"] || "Pending"),
          result: String(row["Result"] || row["result"] || ""),
          orderedDate: safeDate(row["Date"] || row["orderedDate"]),
        }
      });
      invTxCount++;
    }
  }
  console.log(`Migrated ${invTxCount} Investigation Transactions.`);

  // 6. Migrate Inventory
  console.log("Migrating Inventory Items...");
  const inventoryData = getSheetData("Inventory");
  for (const row of inventoryData) {
    const medicineName = row["Medicine Name"] || row["medicineName"];
    if (!medicineName) continue;
    
    const existing = await prisma.inventoryItem.findUnique({ where: { medicineName } });
    if (!existing) {
      await prisma.inventoryItem.create({
        data: {
          medicineId: String(row["Medicine ID"] || row["medicineId"] || require("crypto").randomUUID()),
          medicineName,
          category: String(row["Category"] || row["category"] || "General"),
          batch: String(row["Batch"] || row["batch"] || ""),
          stock: safeInt(row["Quantity"] || row["stock"] || row["Stock"]),
          price: safeNum(row["Price"] || row["price"]),
          expiryDate: String(row["Expiry Date"] || row["expiryDate"] || ""),
          createdAt: safeDate(row["Created At"] || row["createdAt"]),
        }
      });
    }
  }
  console.log(`Migrated ${inventoryData.length} Inventory Items.`);

  // 7. Migrate Pharmacy Dispense
  console.log("Migrating Pharmacy Dispense Logs...");
  const pharmacyData = getSheetData("Pharmacy");
  let pharmacyCount = 0;
  for (const row of pharmacyData) {
    const id = String(row["Dispense ID"] || row["id"]);
    if (!id) continue;
    
    // Skip invalid rows that look like inventory records (where ID starts with MED)
    if (id.toUpperCase().startsWith("MED")) {
      continue;
    }

    const existing = await prisma.pharmacyDispense.findUnique({ where: { id } });
    if (!existing) {
      await prisma.pharmacyDispense.create({
        data: {
          id,
          patientId: String(row["Patient ID"] || row["patientId"] || ""),
          opNumber: String(row["OP Number"] || row["opNumber"] || ""),
          billId: String(row["Bill ID"] || row["billId"] || ""),
          medicineName: String(row["Medicine Name"] || row["medicineName"] || ""),
          batch: String(row["Batch"] || row["batch"] || ""),
          quantity: safeInt(row["Quantity"] || row["quantity"]),
          price: safeNum(row["Price"] || row["price"]),
          amount: safeNum(row["Total Amount"] || row["amount"]),
          dispensedBy: String(row["Dispensed By"] || row["dispensedBy"] || ""),
          dispensedDate: safeDate(row["Date"] || row["dispensedDate"]),
        }
      });
      pharmacyCount++;
    }
  }
  console.log(`Migrated ${pharmacyCount} Pharmacy Dispense logs.`);

  // 8. Migrate Bills
  console.log("Migrating Billing Invoices...");
  const billsData = getSheetData("Bills");
  let billsCount = 0;
  for (const row of billsData) {
    const billNumber = String(row["Bill ID"] || row["billNumber"] || row["id"] || "");
    if (!billNumber) continue;
    
    const existing = await prisma.bill.findUnique({ where: { billNumber } });
    if (!existing) {
      await prisma.bill.create({
        data: {
          billNumber,
          patientId: String(row["Patient ID"] || row["patientId"] || ""),
          opNumber: String(row["OP Number"] || row["opNumber"] || ""),
          items: String(row["Bill Items"] || row["items"] || "[]"),
          consultationCharges: safeNum(row["Consultation Charges"] || row["consultationCharges"]),
          investigationCharges: safeNum(row["Investigation Charges"] || row["investigationCharges"]),
          medicineCharges: safeNum(row["Medicine Charges"] || row["medicineCharges"]),
          otCharges: safeNum(row["OT Charges"] || row["otCharges"]),
          total: safeNum(row["Total Amount"] || row["total"]),
          paidAmount: safeNum(row["Paid Amount"] || row["paidAmount"]),
          pendingAmount: safeNum(row["Pending Amount"] || row["pendingAmount"]),
          paymentMode: String(row["Payment Mode"] || row["paymentMode"] || "Pending"),
          status: String(row["Status"] || row["status"] || "Unpaid"),
          date: safeDate(row["Created Date"] || row["date"]),
        }
      });
      billsCount++;
    }
  }
  console.log(`Migrated ${billsCount} Billing Invoices.`);

  // 9. Migrate OT Procedures
  console.log("Migrating OT Procedures...");
  const otData = getSheetData("OT_Procedures");
  let otCount = 0;
  for (const row of otData) {
    const id = String(row["Procedure ID"] || row["id"]);
    if (!id) continue;
    
    const existing = await prisma.oTProcedure.findUnique({ where: { id } });
    if (!existing) {
      await prisma.oTProcedure.create({
        data: {
          id,
          patientId: String(row["Patient ID"] || row["patientId"] || ""),
          opNumber: String(row["OP Number"] || row["opNumber"] || ""),
          doctor: String(row["Doctor"] || row["doctor"] || ""),
          procedureName: String(row["Procedure Name"] || row["procedureName"] || row["procedure"] || ""),
          cost: safeNum(row["Cost"] || row["cost"] || row["fee"]),
          status: String(row["Status"] || row["status"] || "Scheduled"),
          date: String(row["Procedure Date"] || row["date"] || ""),
          notes: String(row["Notes"] || row["notes"] || ""),
        }
      });
      otCount++;
    }
  }
  console.log(`Migrated ${otCount} OT Procedures.`);

  // 10. Migrate Audit Log
  console.log("Migrating Audit Logs...");
  const auditData = getSheetData("Audit_Log");
  let auditCount = 0;
  for (const row of auditData) {
    const timestamp = row["Timestamp"] || row["timestamp"];
    if (!timestamp) continue;
    
    await prisma.auditLog.create({
      data: {
        timestamp: safeDate(timestamp),
        user: String(row["User"] || row["user"] || ""),
        role: String(row["Role"] || row["role"] || ""),
        module: String(row["Module"] || row["module"] || ""),
        action: String(row["Action"] || row["action"] || ""),
        recordId: String(row["Record ID"] || row["recordId"] || ""),
      }
    });
    auditCount++;
  }
  console.log(`Migrated ${auditCount} Audit Logs.`);

  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
