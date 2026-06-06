const reportService = require("../services/reportService");
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
    const newPatientsToday = patients.filter(p => p.createdAt && p.createdAt.startsWith(today)).length;
    const consultationsToday = consultations.filter(c => c.consultationDate && c.consultationDate.startsWith(today)).length;
    
    const revenueToday = bills
      .filter(b => b.date && b.date.startsWith(today))
      .reduce((sum, b) => sum + Number(b.total), 0);

    res.status(200).json({
      newPatientsToday,
      consultationsToday,
      revenueToday,
      totalPatients: patients.length,
      totalBills: bills.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate dashboard stats", error: error.message });
  }
};

const getReceptionEod = async (req, res) => {
  try {
    const report = await reportService.getReceptionEodReport(req.query.date);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate Reception EOD", error: error.message });
  }
};

const getDoctorEod = async (req, res) => {
  try {
    // If Admin, they might pass a doctorName in query. If Doctor, it must be their own name.
    // For simplicity, we assume req.user.username is the doctor's name if role is DOCTOR.
    let doctorName = req.query.doctorName;
    if (req.user?.role === "DOCTOR") {
      doctorName = req.user.username; // Or however the name is stored
    }
    if (!doctorName) return res.status(400).json({ message: "Doctor name required" });

    const report = await reportService.getDoctorEodReport(doctorName, req.query.date);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate Doctor EOD", error: error.message });
  }
};

const getPharmacyEod = async (req, res) => {
  try {
    const report = await reportService.getPharmacyEodReport(req.query.date);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate Pharmacy EOD", error: error.message });
  }
};

const getAdminEod = async (req, res) => {
  try {
    const report = await reportService.getAdminEodReport(req.query.date);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate Admin EOD", error: error.message });
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
  getReceptionEod,
  getDoctorEod,
  getPharmacyEod,
  getAdminEod,
  downloadPdf,
  downloadExcel,
  sendWhatsapp,
};
