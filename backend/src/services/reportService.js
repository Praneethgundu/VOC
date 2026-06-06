const patientService = require("./patientService");
const consultationService = require("./consultationService");
const billingService = require("./billingService");
const investigationService = require("./investigationService");
const otService = require("./otService");
const pharmacyService = require("./pharmacyService");
const { getHospitalWorkbook } = require("./excelService");

const getDispensedMedicines = async () => {
  try {
    return await pharmacyService.getDispenseHistory();
  } catch (e) {
    return [];
  }
};

const filterByDate = (arr, dateField, targetDate) =>
  arr.filter((item) => {
    const d = item[dateField];
    return d && d.startsWith(targetDate);
  });

const getReceptionEodReport = async (date) => {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const [allPatients, allConsultations, allBills] = await Promise.all([
    patientService.getAllPatients(),
    consultationService.getConsultations(),
    billingService.getBills(),
  ]);

  const todayPatients = filterByDate(allPatients, "createdAt", targetDate);
  const todayConsultations = filterByDate(allConsultations, "consultationDate", targetDate);
  const todayBills = filterByDate(allBills, "date", targetDate);

  const totalRegistrations = todayPatients.length;
  // Approximation for New/Returning
  const newPatients = totalRegistrations; 
  const returningPatients = todayConsultations.length - totalRegistrations > 0 ? todayConsultations.length - totalRegistrations : 0;

  const paidBills = todayBills.filter(b => b.status === "Paid");
  const pendingBills = todayBills.filter(b => b.status === "Unpaid" || b.paymentMode === "Pending");
  
  const cashCollected = paidBills.filter(b => b.paymentMode === "Cash").reduce((sum, b) => sum + Number(b.total || 0), 0);
  const upiCollected = paidBills.filter(b => b.paymentMode === "UPI").reduce((sum, b) => sum + Number(b.total || 0), 0);
  const cardCollected = paidBills.filter(b => b.paymentMode === "Card").reduce((sum, b) => sum + Number(b.total || 0), 0);
  const pendingAmount = pendingBills.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const collectionsReceived = cashCollected + upiCollected + cardCollected;

  const completedRegistrations = todayConsultations.filter(c => c.status === "Completed").length;
  const pendingRegistrations = todayConsultations.filter(c => c.status !== "Completed").length;

  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Report Generated", `Reception EOD Report for ${targetDate}`);

  return {
    date: targetDate,
    stats: {
      totalRegistrations,
      newPatients,
      returningPatients,
      opRegistrations: todayConsultations.length,
      billsGenerated: todayBills.length,
      billsPaid: paidBills.length,
      billsPending: pendingBills.length,
      collectionsReceived,
      pendingAmount
    },
    paymentModeBreakdown: {
      cash: cashCollected,
      upi: upiCollected,
      card: cardCollected,
      pending: pendingAmount
    },
    queueStatus: {
      pendingRegistrations,
      completedRegistrations
    },
    patients: todayPatients
  };
};

const getDoctorEodReport = async (doctorName, date) => {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const [allConsultations, allInvestigations, allProcedures, allBills] = await Promise.all([
    consultationService.getConsultations(),
    investigationService.getInvestigations(),
    otService.getProcedures(),
    billingService.getBills(),
  ]);

  const todayConsultations = filterByDate(allConsultations, "consultationDate", targetDate).filter(c => c.doctor === doctorName);
  const todayInvestigations = filterByDate(allInvestigations, "orderedDate", targetDate).filter(i => i.doctor === doctorName);
  const todayProcedures = filterByDate(allProcedures, "date", targetDate).filter(p => p.doctor === doctorName);
  
  // Need to find bills generated for this doctor's patients today (approximation)
  const patientOpmaps = todayConsultations.map(c => c.opNumber);
  const todayBills = filterByDate(allBills, "date", targetDate).filter(b => patientOpmaps.includes(b.opNumber));
  
  const revenueGenerated = todayBills.filter(b => b.status === "Paid").reduce((sum, b) => sum + Number(b.total || 0), 0);

  const patientsConsulted = todayConsultations.length;
  const patientsPending = todayConsultations.filter(c => c.status !== "Completed").length;
  const patientsCompleted = todayConsultations.filter(c => c.status === "Completed").length;

  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Report Generated", `Doctor EOD Report for ${doctorName} on ${targetDate}`);

  return {
    doctorName,
    date: targetDate,
    stats: {
      patientsConsulted,
      patientsPending,
      patientsCompleted,
      consultationsCompleted: patientsCompleted,
      investigationsOrdered: todayInvestigations.length,
      otProceduresScheduled: todayProcedures.length,
      revenueGenerated
    },
    consultations: todayConsultations,
    investigations: todayInvestigations,
    procedures: todayProcedures
  };
};

const getPharmacyEodReport = async (date) => {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const [allDispensed, allInventory, allBills] = await Promise.all([
    getDispensedMedicines(),
    pharmacyService.getInventory(),
    billingService.getBills(),
  ]);

  const todayDispensed = filterByDate(allDispensed, "dispensedDate", targetDate);
  const pharmacyBills = filterByDate(allBills, "date", targetDate).filter(b => b.department === "Pharmacy" || b.items?.some(i => i.serviceName.includes("Medicine")));

  const medicinesDispensed = todayDispensed.length;
  const revenueGenerated = pharmacyBills.filter(b => b.status === "Paid").reduce((sum, b) => sum + Number(b.total || 0), 0);
  
  const lowStockMedicines = allInventory.filter(i => Number(i.stock) > 0 && Number(i.stock) <= 10).length;
  const outOfStockMedicines = allInventory.filter(i => Number(i.stock) === 0).length;

  // Aggregate dispensed amounts by medicine
  const usageSummary = {};
  todayDispensed.forEach(d => {
    if (!usageSummary[d.medicineId]) usageSummary[d.medicineId] = { count: 0, amount: 0 };
    usageSummary[d.medicineId].count += Number(d.quantity || 1);
    usageSummary[d.medicineId].amount += Number(d.amount || 0);
  });

  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Report Generated", `Pharmacy EOD Report for ${targetDate}`);

  return {
    date: targetDate,
    stats: {
      medicinesDispensed,
      totalPrescriptionsProcessed: pharmacyBills.length,
      revenueGenerated,
      lowStockMedicines,
      outOfStockMedicines
    },
    inventoryAlerts: allInventory.filter(i => Number(i.stock) <= 10),
    dispensed: todayDispensed,
    usageSummary
  };
};

const getAdminEodReport = async (date) => {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const [
    allPatients,
    allConsultations,
    allBills,
    allInvestigations,
    allProcedures,
    allDispensed
  ] = await Promise.all([
    patientService.getAllPatients(),
    consultationService.getConsultations(),
    billingService.getBills(),
    investigationService.getInvestigations(),
    otService.getProcedures(),
    getDispensedMedicines(),
  ]);

  const todayPatients = filterByDate(allPatients, "createdAt", targetDate);
  const todayConsultations = filterByDate(allConsultations, "consultationDate", targetDate);
  const todayBills = filterByDate(allBills, "date", targetDate);
  const todayInvestigations = filterByDate(allInvestigations, "orderedDate", targetDate);
  const todayProcedures = filterByDate(allProcedures, "date", targetDate);
  const todayDispensed = filterByDate(allDispensed, "dispensedDate", targetDate);

  const paidBills = todayBills.filter(b => b.status === "Paid");
  const pendingBills = todayBills.filter(b => b.status === "Unpaid" || b.paymentMode === "Pending");
  
  const totalRevenue = paidBills.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const pendingRevenue = pendingBills.reduce((sum, b) => sum + Number(b.total || 0), 0);

  // Department-wise Revenue
  const departmentRevenue = {};
  paidBills.forEach(b => {
    const dept = b.department || "General";
    departmentRevenue[dept] = (departmentRevenue[dept] || 0) + Number(b.total || 0);
  });

  // Doctor-wise Revenue
  const doctorRevenue = {};
  paidBills.forEach(b => {
    // try to map bill to doctor via consultation
    const consult = todayConsultations.find(c => c.opNumber === b.opNumber);
    const doctor = consult ? consult.doctor : "Unassigned";
    doctorRevenue[doctor] = (doctorRevenue[doctor] || 0) + Number(b.total || 0);
  });

  const auditService = require("./auditService");
  await auditService.logAction("System", "Backend", "Report Generated", `Admin EOD Report for ${targetDate}`);

  return {
    date: targetDate,
    stats: {
      totalRegistrations: todayPatients.length,
      totalConsultations: todayConsultations.length,
      totalInvestigations: todayInvestigations.length,
      totalProcedures: todayProcedures.length,
      totalMedicinesDispensed: todayDispensed.length,
      totalRevenue,
      pendingRevenue,
      collections: totalRevenue,
      pendingBills: pendingBills.length
    },
    departmentRevenue: Object.keys(departmentRevenue).map(k => ({ department: k, amount: departmentRevenue[k] })),
    doctorRevenue: Object.keys(doctorRevenue).map(k => ({ doctor: k, amount: doctorRevenue[k] })),
    recentBills: todayBills
  };
};

module.exports = {
  getReceptionEodReport,
  getDoctorEodReport,
  getPharmacyEodReport,
  getAdminEodReport
};
