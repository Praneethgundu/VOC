const express = require("express");
const { 
  getDashboardStats, 
  getReceptionEod, 
  getDoctorEod, 
  getPharmacyEod, 
  getAdminEod, 
  downloadPdf, 
  downloadExcel, 
  sendWhatsapp 
} = require("../controllers/reportController");
const roleMiddleware = require("../middleware/role.middleware");

// authMiddleware is applied in app.js
const router = express.Router();

router.get("/dashboard", getDashboardStats);

router.get("/eod/reception", roleMiddleware(["RECEPTIONIST", "ADMIN"]), getReceptionEod);
router.get("/eod/doctor", roleMiddleware(["DOCTOR", "ADMIN"]), getDoctorEod);
router.get("/eod/pharmacy", roleMiddleware(["PHARMACIST", "ADMIN"]), getPharmacyEod);
router.get("/eod/admin", roleMiddleware(["ADMIN"]), getAdminEod);

router.get("/eod/download/pdf", downloadPdf);
router.get("/eod/download/excel", downloadExcel);
router.post("/eod/whatsapp", sendWhatsapp);

module.exports = router;
