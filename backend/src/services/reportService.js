const patientService = require("./patientService");
const consultationService = require("./consultationService");
const billingService = require("./billingService");
const investigationService = require("./investigationService");
const otService = require("./otService");
const pharmacyService = require("./pharmacyService");
const { getWorkbook } = require("./excelService");

const getDispensedMedicines = async () => {
  try {
    const { sheet } = await getWorkbook("pharmacy.xlsx", "Dispensed", []);
    const dispensed = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      dispensed.push({
        id: row.getCell(1).value,
        opNumber: row.getCell(2).value,
        medicineId: row.getCell(3).value,
        quantity: row.getCell(4).value,
        amount: row.getCell(5).value,
        dispensedDate: row.getCell(6).value,
      });
    });
    return dispensed;
  } catch (e) {
    return [];
  }
};

const getEodReport = async (date) => {
  // Use provided date or today
  const targetDate = date || new Date().toISOString().split("T")[0];

  const [
    allPatients,
    allConsultations,
    allBills,
    allInvestigations,
    allProcedures,
    allDispensed,
    allInventory,
  ] = await Promise.all([
    patientService.getAllPatients(),
    consultationService.getConsultations(),
    billingService.getBills(),
    investigationService.getInvestigations(),
    otService.getProcedures(),
    getDispensedMedicines(),
    pharmacyService.getInventory(),
  ]);

  // Filter by date
  const filterByDate = (arr, dateField) =>
    arr.filter((item) => {
      const d = item[dateField];
      return d && d.startsWith(targetDate);
    });

  const todayPatients = filterByDate(allPatients, "createdAt");
  const todayConsultations = filterByDate(allConsultations, "consultationDate");
  const todayBills = filterByDate(allBills, "date");
  const todayInvestigations = filterByDate(allInvestigations, "orderedDate");
  const todayProcedures = filterByDate(allProcedures, "date");
  const todayDispensed = filterByDate(allDispensed, "dispensedDate");

  // Basic KPI Stats
  const revenueCollected = todayBills
    .filter((b) => b.status === "Paid")
    .reduce((sum, b) => sum + Number(b.total || 0), 0);
    
  const pendingRevenue = todayBills
    .filter((b) => b.status === "Unpaid" || b.paymentMode === "Pending")
    .reduce((sum, b) => sum + Number(b.total || 0), 0);

  const executiveSummary = {
    totalPatients: todayPatients.length,
    consultations: todayConsultations.length,
    investigations: todayInvestigations.length,
    procedures: todayProcedures.length,
    medicinesDispensed: todayDispensed.length,
    totalRevenue: revenueCollected + pendingRevenue,
    pendingRevenue: pendingRevenue,
    paidBills: todayBills.filter((b) => b.status === "Paid").length,
    pendingBills: todayBills.filter((b) => b.status === "Unpaid" || b.paymentMode === "Pending").length,
  };

  // Patient-Wise Detailed Report Mapping
  const patientMap = {}; // OP Number -> Details

  [...todayPatients, ...todayConsultations].forEach((p) => {
    if (!patientMap[p.opNumber]) {
      const patientInfo = allPatients.find(ap => ap.opNumber === p.opNumber) || {};
      patientMap[p.opNumber] = {
        patientName: p.patientName || patientInfo.patientName || "Unknown",
        opNumber: p.opNumber,
        age: patientInfo.age || "-",
        gender: patientInfo.gender || "-",
        department: p.department || "General Orthopaedics",
        doctor: p.doctor || "-",
        status: p.status || "Waiting",
        collectedAmount: 0,
        pendingAmount: 0,
        bills: [],
        investigations: [],
        procedures: [],
        medicines: [],
      };
    } else {
      if (p.doctor) patientMap[p.opNumber].doctor = p.doctor;
      if (p.status) patientMap[p.opNumber].status = p.status;
    }
  });

  todayBills.forEach((b) => {
    if (patientMap[b.opNumber]) {
      patientMap[b.opNumber].bills.push(b);
      if (b.status === "Paid") {
        patientMap[b.opNumber].collectedAmount += Number(b.total || 0);
      } else {
        patientMap[b.opNumber].pendingAmount += Number(b.total || 0);
      }
    }
  });

  todayInvestigations.forEach((inv) => {
    if (patientMap[inv.opNumber]) {
      patientMap[inv.opNumber].investigations.push(inv);
    }
  });

  todayProcedures.forEach((proc) => {
    const pKey = Object.keys(patientMap).find(k => patientMap[k].patientName === proc.patientName);
    if (pKey) {
      patientMap[pKey].procedures.push(proc);
    }
  });

  todayDispensed.forEach((disp) => {
    if (patientMap[disp.opNumber]) {
      const med = allInventory.find(i => i.medicineId === disp.medicineId);
      patientMap[disp.opNumber].medicines.push({
        ...disp,
        medicineName: med ? med.medicineName : "Unknown Medicine",
        unitPrice: med ? med.price : 0,
      });
    }
  });

  return {
    executiveSummary,
    patientReports: Object.values(patientMap),
    investigations: todayInvestigations,
    procedures: todayProcedures,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  getEodReport,
};
