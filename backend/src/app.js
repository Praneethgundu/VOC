const express = require("express");
const cors = require("cors");

const patientRoutes = require("./routes/patientRoutes");
const consultationRoutes =require("./routes/consultationRoutes");
const investigationRoutes =require("./routes/investigationRoutes");
const pharmacyRoutes =require("./routes/pharmacyRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientRoutes);
app.use("/api/consultations",consultationRoutes);
app.use("/api/investigations",investigationRoutes);
app.use("/api/pharmacy",pharmacyRoutes);
app.get("/", (req, res) => {
  res.send("VOC HMS Backend Running");
});

module.exports = app;



