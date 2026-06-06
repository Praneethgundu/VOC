const { getHospitalWorkbook, saveHospitalWorkbook, releaseLock } = require("./excelService");
const crypto = require("crypto");
const patientService = require("./patientService");

const inventoryColumns = [
  { header: "Medicine ID", key: "medicineId", width: 20 },
  { header: "Medicine Name", key: "medicineName", width: 30 },
  { header: "Batch", key: "batch", width: 20 },
  { header: "Stock", key: "stock", width: 15 },
  { header: "Price", key: "price", width: 15 },
  { header: "Expiry Date", key: "expiryDate", width: 20 },
  { header: "Category", key: "category", width: 20 },
  { header: "Created At", key: "createdAt", width: 25 },
];

const dispenseColumns = [
  { header: "Dispense ID", key: "id", width: 20 },
  { header: "Patient ID", key: "patientId", width: 36 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Medicine Name", key: "medicineName", width: 30 },
  { header: "Batch", key: "batch", width: 20 },
  { header: "Quantity Dispensed", key: "quantity", width: 20 },
  { header: "Price", key: "price", width: 15 },
  { header: "Total Amount", key: "amount", width: 15 },
  { header: "Dispensed Date", key: "dispensedDate", width: 25 },
];

const getInventorySheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Inventory");
  return { workbook, sheet };
};

const getDispenseSheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Pharmacy");
  return { workbook, sheet };
};

const getInventory = async () => {
  const { sheet } = await getInventorySheet();
  const inventory = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    inventory.push({
      medicineId: row.getCell(1).value,
      medicineName: row.getCell(2).value,
      batch: row.getCell(3).value,
      stock: row.getCell(4).value,
      price: row.getCell(5).value,
      expiryDate: row.getCell(6).value,
      category: row.getCell(7).value,
    });
  });
  
  releaseLock();
  return inventory;
};

const addMedicine = async (data) => {
  const { workbook, sheet } = await getInventorySheet();
  
  const medicineId = "MED-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const newMedicine = {
    medicineId,
    medicineName: data.medicineName,
    batch: data.batch || "",
    stock: data.quantity || data.stock || 0,
    price: data.price,
    expiryDate: data.expiryDate,
    category: data.category || "",
    createdAt: new Date().toISOString(),
  };
  
  sheet.addRow(newMedicine);
  await saveHospitalWorkbook(workbook);
  
  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Medicine Added", `ID: ${medicineId}`);
  
  return newMedicine;
};

const updateStock = async (medicineId, quantityDelta) => {
  const { workbook, sheet } = await getInventorySheet();
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
    await saveHospitalWorkbook(workbook);
  } else {
    releaseLock();
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
      patientId: row.getCell(2).value,
      opNumber: row.getCell(3).value,
      medicineName: row.getCell(4).value,
      batch: row.getCell(5).value,
      quantity: row.getCell(6).value,
      price: row.getCell(7).value,
      amount: row.getCell(8).value,
      dispensedDate: row.getCell(9).value,
    });
  });
  
  releaseLock();
  return history.reverse(); // Newest first
};

const dispenseMedicine = async (data) => {
  // data: { opNumber, patientId, medicineId, quantity, amount }
  const { workbook, sheet } = await getDispenseSheet();
  
  const patientsSheet = workbook.getWorksheet("Patients");
  let patient = null;
  if (patientsSheet) {
    patientsSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && row.getCell(2).value === data.opNumber) {
        patient = { patientId: row.getCell(1).value, opNumber: row.getCell(2).value };
      }
    });
  }
  if (!patient) { releaseLock(); throw new Error("Invalid Patient OP Number"); }
  
  const inventorySheet = workbook.getWorksheet("Inventory");
  let medicine = null;
  let medicineRowNumber = null;
  if (inventorySheet) {
    inventorySheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && row.getCell(1).value === data.medicineId) {
        medicine = {
          medicineName: row.getCell(2).value,
          batch: row.getCell(3).value,
          stock: row.getCell(4).value,
          price: row.getCell(5).value,
        };
        medicineRowNumber = rowNumber;
      }
    });
  }
  
  if (!medicine) { releaseLock(); throw new Error("Medicine not found"); }

  // Update stock
  const currentQty = Number(medicine.stock) || 0;
  inventorySheet.getRow(medicineRowNumber).getCell(4).value = currentQty - Number(data.quantity);

  const id = crypto.randomBytes(4).toString("hex");
  const dispenseRecord = {
    id,
    patientId: data.patientId || patient.patientId || "",
    opNumber: data.opNumber,
    medicineName: medicine.medicineName,
    batch: medicine.batch,
    quantity: data.quantity,
    price: medicine.price,
    amount: data.amount || (medicine.price * data.quantity),
    dispensedDate: new Date().toISOString(),
  };
  
  sheet.addRow(dispenseRecord);
  await saveHospitalWorkbook(workbook);
  
  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Medicine Dispensed", `ID: ${id}`);
  
  return dispenseRecord;
};

const updateMedicine = async (medicineId, updateData) => {
  const { workbook, sheet } = await getInventorySheet();
  let updated = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === medicineId) {
      if (updateData.medicineName) row.getCell(2).value = updateData.medicineName;
      if (updateData.category) row.getCell(3).value = updateData.category;
      if (updateData.quantity !== undefined) row.getCell(4).value = updateData.quantity;
      if (updateData.price !== undefined) row.getCell(5).value = updateData.price;
      if (updateData.expiryDate) row.getCell(6).value = updateData.expiryDate;

      updated = {
        medicineId,
        medicineName: row.getCell(2).value,
        category: row.getCell(3).value,
        quantity: row.getCell(4).value,
        price: row.getCell(5).value,
        expiryDate: row.getCell(6).value,
        createdAt: row.getCell(7).value,
      };
    }
  });

  if (updated) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return updated;
};

const deleteMedicine = async (medicineId) => {
  const { workbook, sheet } = await getInventorySheet();
  let deleted = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === medicineId) {
      sheet.spliceRows(rowNumber, 1);
      deleted = true;
    }
  });

  if (deleted) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return deleted;
};

module.exports = {
  getInventory,
  addMedicine,
  updateStock,
  dispenseMedicine,
  getDispenseHistory,
  updateMedicine,
  deleteMedicine,
};