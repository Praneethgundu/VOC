const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const consultationRoutes =require("./routes/consultationRoutes");
const investigationRoutes =require("./routes/investigationRoutes");
const pharmacyRoutes =require("./routes/pharmacyRoutes");

const billingRoutes = require("./routes/billingRoutes");
const otRoutes = require("./routes/otRoutes");
const auditRoutes = require("./routes/auditRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const authMiddleware = require("./middleware/auth.middleware");
const roleMiddleware = require("./middleware/role.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/patients", authMiddleware, roleMiddleware(["RECEPTIONIST", "ADMIN"]), patientRoutes);
app.use("/api/consultations", authMiddleware, roleMiddleware(["DOCTOR", "ADMIN"]), consultationRoutes);
app.use("/api/investigations", authMiddleware, roleMiddleware(["DOCTOR", "ADMIN"]), investigationRoutes);
app.use("/api/pharmacy", authMiddleware, roleMiddleware(["PHARMACIST", "ADMIN"]), pharmacyRoutes);
app.use("/api/billing", authMiddleware, roleMiddleware(["RECEPTIONIST", "ADMIN"]), billingRoutes);
app.use("/billing", authMiddleware, roleMiddleware(["RECEPTIONIST", "ADMIN"]), billingRoutes); // Fallback for misconfigured NEXT_PUBLIC_API_URL
app.use("/api/ot", authMiddleware, roleMiddleware(["DOCTOR", "ADMIN"]), otRoutes);
app.use("/api/audit", authMiddleware, roleMiddleware(["ADMIN"]), auditRoutes);
app.use("/api/reports", authMiddleware, roleMiddleware(["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"]), reportRoutes);
app.use("/reports", authMiddleware, roleMiddleware(["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"]), reportRoutes); // Fallback
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

app.get("/", (req, res) => {
  res.send("VOC HMS Backend Running");
});

app.get("/debug-excel", async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const path = require('path');
    const excelFilePath = path.join(__dirname, '../../Investigation.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const sheet = workbook.worksheets[0];
    const rawRows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 5) {
        rawRows.push(row.values);
      }
    });
    res.json({ success: true, rawRows });
  } catch (err) {
    res.json({ success: false, error: err.message, stack: err.stack });
  }
});

module.exports = app;



