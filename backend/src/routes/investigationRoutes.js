const express = require("express");
const { createInvestigation, getInvestigations, updateInvestigation } = require("../controllers/investigationController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createInvestigation);
router.get("/", getInvestigations);
router.put("/:id", updateInvestigation);

module.exports = router;