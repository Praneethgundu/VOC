const express = require("express");
const { createConsultation, getConsultations, updateStatus } = require("../controllers/consultationController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createConsultation);
router.get("/", getConsultations);
router.put("/:id/status", updateStatus);

module.exports = router;