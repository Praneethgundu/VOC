const express = require("express");
const { getDashboardStats, getEodReport, downloadPdf, downloadExcel, sendWhatsapp } = require("../controllers/reportController");
// authMiddleware is applied in app.js
const router = express.Router();

router.get("/dashboard", getDashboardStats);
router.get("/eod", getEodReport);
router.get("/eod/download/pdf", downloadPdf);
router.get("/eod/download/excel", downloadExcel);
router.post("/eod/whatsapp", sendWhatsapp);

module.exports = router;
