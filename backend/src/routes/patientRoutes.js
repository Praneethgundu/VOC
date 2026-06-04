const express = require("express");
const { createPatient, getAllPatients } = require("../controllers/patientController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPatient);
router.get("/", getAllPatients);

module.exports = router;