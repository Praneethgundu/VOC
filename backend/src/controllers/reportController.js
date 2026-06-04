// Basic report controller to aggregate data
const patientService = require("../services/patientService");
const consultationService = require("../services/consultationService");
const billingService = require("../services/billingService");

const getDashboardStats = async (req, res) => {
  try {
    const patients = await patientService.getAllPatients();
    const consultations = await consultationService.getConsultations();
    const bills = await billingService.getBills();

    const today = new Date().toISOString().split("T")[0];
    
    // Simple aggregations
    const newPatientsToday = patients.filter(p => p.createdAt.startsWith(today)).length;
    const consultationsToday = consultations.filter(c => c.consultationDate.startsWith(today)).length;
    
    const revenueToday = bills
      .filter(b => b.date.startsWith(today))
      .reduce((sum, b) => sum + Number(b.total), 0);

    res.status(200).json({
      newPatientsToday,
      consultationsToday,
      revenueToday,
      totalPatients: patients.length,
      totalBills: bills.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate reports", error: error.message });
  }
};

const getEodReport = async (req, res) => {
  try {
    const reportService = require("../services/reportService");
    const date = req.query.date; // Optional date filter
    const report = await reportService.getEodReport(date);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate EOD report", error: error.message });
  }
};

const downloadPdf = async (req, res) => {
  res.status(200).json({ message: "PDF Download endpoint" });
};

const downloadExcel = async (req, res) => {
  res.status(200).json({ message: "Excel Download endpoint" });
};

const sendWhatsapp = async (req, res) => {
  res.status(200).json({ message: "WhatsApp send endpoint" });
};

module.exports = {
  getDashboardStats,
  getEodReport,
  downloadPdf,
  downloadExcel,
  sendWhatsapp,
};
