const { getHospitalWorkbook, saveHospitalWorkbook, releaseLock } = require("./excelService");
const consultationService = require("./consultationService");
// const pharmacyService = require("./pharmacyService"); // if needed in future for unbilled
const crypto = require("crypto");

const columns = [
  { header: "Bill Number", key: "id", width: 20 },
  { header: "Patient ID", key: "patientId", width: 36 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Invoice Date", key: "date", width: 25 },
  { header: "Line Items", key: "items", width: 50 },
  { header: "Amount", key: "total", width: 15 },
  { header: "Paid Amount", key: "paidAmount", width: 15 },
  { header: "Pending Amount", key: "pendingAmount", width: 15 },
  { header: "Payment Mode", key: "paymentMode", width: 15 },
  { header: "Payment Status", key: "status", width: 15 },
];

const getBillingSheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Bills");
  return { workbook, sheet };
};

const createBill = async (data) => {
  const { workbook, sheet } = await getBillingSheet();
  
  const id = "BILL-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const items = Array.isArray(data.items) ? data.items : [];
  const total = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  
  const paidAmount = Number(data.paidAmount) || (data.paymentMode === "Pending" ? 0 : total);
  const pendingAmount = total - paidAmount;

  const newBill = {
    billNumber: id,
    patientId: data.patientId || "",
    opNumber: data.opNumber || "Unknown",
    date: new Date().toISOString(),
    items: JSON.stringify(items),
    total,
    paidAmount,
    pendingAmount,
    paymentMode: data.paymentMode || "Pending",
    status: data.status || (pendingAmount > 0 ? "Unpaid" : "Paid"),
  };
  
  sheet.addRow(newBill);
  await saveHospitalWorkbook(workbook);
  
  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Bill Generated", `ID: ${id}`);
  
  return newBill;
};

const getBills = async () => {
  const { sheet } = await getBillingSheet();
  const bills = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(row.getCell(4).value || "[]");
    } catch(e) {
      parsedItems = [];
    }

    bills.push({
      id: row.getCell(1).value,
      patientId: row.getCell(2).value,
      opNumber: row.getCell(3).value,
      items: parsedItems,
      total: row.getCell(9).value,
      paidAmount: row.getCell(10).value,
      pendingAmount: row.getCell(11).value,
      paymentMode: row.getCell(12).value,
      status: row.getCell(13).value,
      date: row.getCell(14).value,
    });
  });
  
  releaseLock();
  return bills.reverse();
};

const updatePaymentStatus = async (id, status) => {
  const { workbook, sheet } = await getBillingSheet();
  let updated = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      row.getCell(13).value = status;
      if (status === "Paid") {
        row.getCell(10).value = row.getCell(9).value; // Paid = Total
        row.getCell(11).value = 0; // Pending = 0
      }
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

// Aggregates unbilled items from completed consultations and newly registered patients
const getUnbilledPatients = async () => {
  try {
    const patientService = require("./patientService");
    const consultations = await consultationService.getConsultations();
    const patients = await patientService.getAllPatients();
    const bills = await getBills();
    
    // Create a set of already billed OP numbers to avoid double billing for now
    const billedOps = new Set(bills.map(b => b.opNumber));
    
    const unbilledMap = new Map();
    
    // 1. Process all registered patients for Registration Fee
    for (const p of patients) {
      if (!billedOps.has(p.opNumber)) {
        unbilledMap.set(p.opNumber, {
          patientName: p.fullName,
          opNumber: p.opNumber,
          department: p.department || "Orthopaedics",
          complaint: p.complaint || "N/A",
          items: [{ serviceName: `Registration Fee`, category: 'Registration', amount: 200 }]
        });
      }
    }
    
    // 2. Process consultations (both for new and existing patients if we want to bill them)
    // Wait, the logic for billedOps prevents billing them for consultation if they've EVER been billed.
    // That's a known limitation in the existing system. We will preserve it for now.
    for (const c of consultations) {
      if (c.status === "Completed" && !billedOps.has(c.opNumber)) {
        
        let existing = unbilledMap.get(c.opNumber);
        if (!existing) {
          existing = {
            patientName: c.patientName,
            opNumber: c.opNumber,
            department: c.department || "Orthopaedics",
            complaint: c.complaint || "N/A",
            items: []
          };
          unbilledMap.set(c.opNumber, existing);
        }
        
        existing.items.push({ serviceName: `Consultation Fee (${c.department || 'General'})`, category: 'Consultation', amount: 500 });
        
        if (c.investigations && Array.isArray(c.investigations)) {
          c.investigations.forEach(inv => {
            const invName = typeof inv === 'string' ? inv : inv.name;
            const invPrice = typeof inv === 'string' ? getInvestigationPrice(inv) : inv.price;
            existing.items.push({ serviceName: invName, category: 'Investigation', amount: invPrice });
          });
        }
      }
    }
    
    // Convert map to array and calculate total
    const unbilled = Array.from(unbilledMap.values()).map(entry => {
      return {
        ...entry,
        total: entry.items.reduce((acc, it) => acc + (it.amount || 0), 0)
      };
    });
    
    return unbilled;
  } catch(e) {
    console.error("Error fetching unbilled", e);
    return [];
  }
};

const getInvestigationPrice = (name) => {
  const prices = {
    "X-Ray Knee AP/Lat": 400,
    "X-Ray Cervical Spine": 450,
    "X-Ray Lumbar Spine": 450,
    "X-Ray Pelvis": 400,
    "MRI Knee Joint": 3500,
    "MRI Cervical Spine": 4000,
    "MRI Lumbar Spine": 4000,
    "MRI Shoulder": 3500,
    "CT Scan Joints": 2500,
    "DEXA Bone Density Scan": 1500,
    "Rheumatoid Factor (RF)": 600,
    "Serum Uric Acid": 200,
    "Serum Calcium": 250,
    "Vitamin D3 (25-OH)": 1200,
    "CRP (C-Reactive Protein)": 400,
    "ESR": 150
  };
  return prices[name] || 500;
};

const updateBill = async (id, updateData) => {
  const { workbook, sheet } = await getBillingSheet();
  let updated = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      if (updateData.paymentMode) row.getCell(12).value = updateData.paymentMode;
      if (updateData.status) row.getCell(13).value = updateData.status;
      
      updated = {
        id,
        patientId: row.getCell(2).value,
        opNumber: row.getCell(3).value,
        items: JSON.parse(row.getCell(4).value || "[]"),
        total: row.getCell(9).value,
        paidAmount: row.getCell(10).value,
        pendingAmount: row.getCell(11).value,
        paymentMode: row.getCell(12).value,
        status: row.getCell(13).value,
        date: row.getCell(14).value,
      };
    }
  });

  if (updated) await saveHospitalWorkbook(workbook);
  else releaseLock();
  return updated;
};

const deleteBill = async (id) => {
  const { workbook, sheet } = await getBillingSheet();
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
  createBill,
  getBills,
  updatePaymentStatus,
  getUnbilledPatients,
  updateBill,
  deleteBill
};