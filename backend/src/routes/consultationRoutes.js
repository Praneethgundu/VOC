const express = require("express");
const { createConsultation, getConsultations, updateStatus, updateConsultation, deleteConsultation } = require("../controllers/consultationController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createConsultation);
router.get("/", getConsultations);
router.put("/:id/status", updateStatus); // legacy status update
router.put("/:id", updateConsultation);
router.delete("/:id", deleteConsultation);

module.exports = router;