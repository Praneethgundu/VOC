const express = require("express");

const {
  getMedicines,
  addMedicine,
  updateStock,
} = require(
  "../controllers/pharmacyController"
);

const router =
  express.Router();

router.get(
  "/",
  getMedicines
);

router.post(
  "/",
  addMedicine
);

router.put(
  "/:medicineId",
  updateStock
);

module.exports = router;