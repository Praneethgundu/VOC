const express = require("express");
const { createPatient, getAllPatients, updatePatient, deletePatient, getPatientRecord } = require("../controllers/patientController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPatient);
router.get("/", getAllPatients);
router.get("/:opNumber/record", getPatientRecord);
router.put("/:opNumber", updatePatient);
router.delete("/:opNumber", deletePatient);

module.exports = router;