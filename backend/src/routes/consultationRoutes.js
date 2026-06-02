const express = require("express");

const {
  getConsultations,
  addConsultation,
  getConsultationByOP,
} = require(
  "../controllers/consultationController"
);

const router =
  express.Router();

router.get(
  "/",
  getConsultations
);

router.post(
  "/",
  addConsultation
);

router.get(
  "/:opNumber",
  getConsultationByOP
);

module.exports = router;