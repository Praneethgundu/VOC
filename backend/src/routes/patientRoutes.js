const express = require("express");

const {
  getPatients,
  addPatient,
  getPatientByOP,
} = require(
  "../controllers/patientController"
);

const router =
  express.Router();

router.get(
  "/",
  getPatients
);

router.post(
  "/",
  addPatient
);

router.get(
  "/:opNumber",
  getPatientByOP
);

module.exports = router;