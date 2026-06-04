const { getWorkbook } = require("./excelService");
const crypto = require("crypto");
const patientService = require("./patientService");

const inventoryColumns = [
  { header: "Medicine ID", key: "medicineId", width: 20 },
  { header: "Medicine Name", key: "medicineName", width: 30 },
  { header: "Category", key: "category", width: 20 },
  { header: "Quantity", key: "quantity", width: 15 },
  { header: "Price", key: "price", width: 15 },
  { header: "Expiry Date", key: "expiryDate", width: 20 },
  { header: "Created At", key: "createdAt", width: 25 },
];

const dispenseColumns = [
  { header: "Dispense ID", key: "id", width: 20 },
  { header: "Patient OP", key: "opNumber", width: 20 },
  { header: "Medicine ID", key: "medicineId", width: 20 },
  { header: "Quantity Dispensed", key: "quantity", width: 20 },
  { header: "Total Amount", key: "amount", width: 15 },
  { header: "Dispensed Date", key: "dispensedDate", width: 25 },
];

const getInventorySheet = async () => {
  const { workbook, filePath } = await getWorkbook("inventory.xlsx", "Inventory", inventoryColumns);
  let sheet = workbook.getWorksheet("Inventory");
  if (!sheet) {
    sheet = workbook.addWorksheet("Inventory");
    sheet.columns = inventoryColumns;
    await workbook.xlsx.writeFile(filePath);
  }
  return { workbook, sheet, filePath };
};

const getDispenseSheet = async () => {
  const { workbook, filePath } = await getWorkbook("pharmacy.xlsx", "Dispensed", dispenseColumns);
  let sheet = workbook.getWorksheet("Dispensed");
  if (!sheet) {
    sheet = workbook.addWorksheet("Dispensed");
    sheet.columns = dispenseColumns;
    await workbook.xlsx.writeFile(filePath);
  }
  return { workbook, sheet, filePath };
};

const getInventory = async () => {
  const { sheet } = await getInventorySheet();
  const inventory = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    inventory.push({
      medicineId: row.getCell(1).value,
      medicineName: row.getCell(2).value,
      category: row.getCell(3).value,
      quantity: row.getCell(4).value,
      price: row.getCell(5).value,
      expiryDate: row.getCell(6).value,
    });
  });
  
  return inventory;
};

const addMedicine = async (data) => {
  const { workbook, sheet, filePath } = await getInventorySheet();
  
  const medicineId = "MED-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const newMedicine = {
    medicineId,
    medicineName: data.medicineName,
    category: data.category,
    quantity: data.quantity,
    price: data.price,
    expiryDate: data.expiryDate,
    createdAt: new Date().toISOString(),
  };
  
  sheet.addRow(newMedicine);
  await workbook.xlsx.writeFile(filePath);
  return newMedicine;
};

const updateStock = async (medicineId, quantityDelta) => {
  const { workbook, sheet, filePath } = await getInventorySheet();
  let updated = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === medicineId) {
      const currentQty = Number(row.getCell(4).value) || 0;
      row.getCell(4).value = currentQty + quantityDelta;
      updated = true;
    }
  });

  if (updated) {
    await workbook.xlsx.writeFile(filePath);
  }
  return updated;
};

const getDispenseHistory = async () => {
  const { sheet } = await getDispenseSheet();
  const history = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    history.push({
      id: row.getCell(1).value,
      opNumber: row.getCell(2).value,
      medicineId: row.getCell(3).value,
      quantity: row.getCell(4).value,
      amount: row.getCell(5).value,
      dispensedDate: row.getCell(6).value,
    });
  });
  
  return history.reverse(); // Newest first
};

const dispenseMedicine = async (data) => {
  // data: { opNumber, medicineId, quantity, amount }
  const { workbook, sheet, filePath } = await getDispenseSheet();
  
  // Validate OP Number
  const patients = await patientService.getAllPatients();
  const patient = patients.find(p => p.opNumber === data.opNumber);
  if (!patient) throw new Error("Invalid Patient OP Number");
  
  // First, reduce stock
  const stockUpdated = await updateStock(data.medicineId, -Number(data.quantity));
  if (!stockUpdated) throw new Error("Medicine not found or stock update failed");

  const id = crypto.randomBytes(4).toString("hex");
  const dispenseRecord = {
    id,
    opNumber: data.opNumber,
    medicineId: data.medicineId,
    quantity: data.quantity,
    amount: data.amount,
    dispensedDate: new Date().toISOString(),
  };
  
  sheet.addRow(dispenseRecord);
  await workbook.xlsx.writeFile(filePath);
  return dispenseRecord;
};

module.exports = {
  getInventory,
  addMedicine,
  updateStock,
  dispenseMedicine,
  getDispenseHistory,
};