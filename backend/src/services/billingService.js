const { getWorkbook } = require("./excelService");
const consultationService = require("./consultationService");
// const pharmacyService = require("./pharmacyService"); // if needed in future for unbilled
const crypto = require("crypto");

const columns = [
  { header: "Bill ID", key: "id", width: 20 },
  { header: "Patient Name", key: "patientName", width: 25 },
  { header: "OP Number", key: "opNumber", width: 20 },
  { header: "Bill Items", key: "items", width: 50 },
  { header: "Total", key: "total", width: 15 },
  { header: "Payment Mode", key: "paymentMode", width: 15 },
  { header: "Status", key: "status", width: 15 },
  { header: "Date", key: "date", width: 25 },
];

const getBillingSheet = async () => {
  const { workbook, filePath } = await getWorkbook("billing.xlsx", "Billing", columns);
  const sheet = workbook.getWorksheet("Billing");
  return { workbook, sheet, filePath };
};

const createBill = async (data) => {
  const { workbook, sheet, filePath } = await getBillingSheet();
  
  const id = "BILL-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const items = Array.isArray(data.items) ? data.items : [];
  const total = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  const newBill = {
    id,
    patientName: data.patientName || "Unknown",
    opNumber: data.opNumber || "Unknown",
    items: JSON.stringify(items),
    total,
    paymentMode: data.paymentMode || "Pending",
    status: data.status || (data.paymentMode === "Pending" ? "Unpaid" : "Paid"),
    date: new Date().toISOString(),
  };
  
  sheet.addRow(newBill);
  await workbook.xlsx.writeFile(filePath);
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
      patientName: row.getCell(2).value,
      opNumber: row.getCell(3).value,
      items: parsedItems,
      total: row.getCell(5).value,
      paymentMode: row.getCell(6).value,
      status: row.getCell(7).value,
      date: row.getCell(8).value,
    });
  });
  
  return bills.reverse();
};

const updatePaymentStatus = async (id, status) => {
  const { workbook, sheet, filePath } = await getBillingSheet();
  let updated = false;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(1).value === id) {
      row.getCell(7).value = status;
      updated = true;
    }
  });

  if (updated) {
    await workbook.xlsx.writeFile(filePath);
  }
  return updated;
};

// Aggregates unbilled items from completed consultations
const getUnbilledPatients = async () => {
  try {
    const consultations = await consultationService.getConsultations();
    const bills = await getBills();
    
    // Create a set of already billed OP numbers to avoid double billing for now
    const billedOps = new Set(bills.map(b => b.opNumber));
    
    const unbilled = [];
    
    for (const c of consultations) {
      if (c.status === "Completed" && !billedOps.has(c.opNumber)) {
        // Construct unbilled items
        const items = [];
        items.push({ serviceName: `Consultation Fee (${c.department || 'General'})`, category: 'Consultation', amount: 500 });
        
        if (c.investigations && Array.isArray(c.investigations)) {
          c.investigations.forEach(inv => {
            items.push({ serviceName: inv, category: 'Investigation', amount: getInvestigationPrice(inv) });
          });
        }
        
        unbilled.push({
          patientName: c.patientName,
          opNumber: c.opNumber,
          department: c.department || "Orthopaedics",
          items,
          total: items.reduce((acc, it) => acc + it.amount, 0)
        });
      }
    }
    
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

module.exports = {
  createBill,
  getBills,
  updatePaymentStatus,
  getUnbilledPatients
};