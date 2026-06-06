const pharmacyService = require("./pharmacyService");
const patientService = require("./patientService");
const billingService = require("./billingService");
const investigationService = require("./investigationService");

const getSystemAlerts = async () => {
  const alerts = [];
  
  try {
    // 1. Pharmacy Low Stock
    const inventory = await pharmacyService.getInventory();
    const lowStockMeds = inventory.filter(m => Number(m.quantity) < 50);
    if (lowStockMeds.length > 0) {
      alerts.push({
        id: `pharmacy_low_stock`,
        type: 'warning',
        module: 'Pharmacy',
        title: 'Low Stock Alert',
        message: `${lowStockMeds.length} medicine(s) are running low on stock.`,
        actionPath: '/pharmacy',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Waiting Patients
    const patients = await patientService.getAllPatients();
    const waitingPatients = patients.filter(p => p.status === "Registered");
    if (waitingPatients.length > 0) {
      alerts.push({
        id: `consultation_waiting`,
        type: 'info',
        module: 'Consultation',
        title: 'Patients Waiting',
        message: `${waitingPatients.length} patient(s) waiting for consultation.`,
        actionPath: '/consultation',
        timestamp: new Date().toISOString()
      });
    }

    // 3. Unbilled Patients
    const unbilledPatients = await billingService.getUnbilledPatients();
    if (unbilledPatients.length > 0) {
      alerts.push({
        id: `billing_pending`,
        type: 'warning',
        module: 'Billing',
        title: 'Pending Bills',
        message: `${unbilledPatients.length} patient(s) have unbilled items.`,
        actionPath: '/billing',
        timestamp: new Date().toISOString()
      });
    }

    // 4. Pending Investigations
    const investigations = await investigationService.getInvestigations();
    const pendingInvestigations = investigations.filter(i => i.status && i.status.toLowerCase() !== "completed");
    if (pendingInvestigations.length > 0) {
      alerts.push({
        id: `investigation_pending`,
        type: 'info',
        module: 'Investigations',
        title: 'Pending Lab Tests',
        message: `${pendingInvestigations.length} ordered investigation(s) pending.`,
        actionPath: '/investigations',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error generating system alerts:", error);
  }

  return alerts;
};

module.exports = {
  getSystemAlerts
};
