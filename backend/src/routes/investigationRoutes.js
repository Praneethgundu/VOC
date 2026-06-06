const express = require("express");
const { createInvestigation, getInvestigations, getInvestigationMaster, updateInvestigation, deleteInvestigation } = require("../controllers/investigationController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/master", getInvestigationMaster);
router.post("/", createInvestigation);
router.get("/", getInvestigations);
router.put("/:id", updateInvestigation);
router.delete("/:id", deleteInvestigation);

module.exports = router;