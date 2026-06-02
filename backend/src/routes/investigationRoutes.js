const express = require("express");

const {
  getInvestigations,
  addInvestigation,
  getInvestigationByOP,
  updateStatus,
} = require(
  "../controllers/investigationController"
);

const router =
  express.Router();

router.get(
  "/",
  getInvestigations
);

router.post(
  "/",
  addInvestigation
);

router.get(
  "/:opNumber",
  getInvestigationByOP
);

router.put(
  "/status/:opNumber",
  updateStatus
);

module.exports = router;