const express = require("express");
const { getInventory, addMedicine, dispenseMedicine, restockMedicine, getDispenseHistory } = require("../controllers/pharmacyController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/inventory", getInventory);
router.get("/dispense-history", getDispenseHistory);
router.post("/inventory", addMedicine);
router.post("/dispense", dispenseMedicine);
router.post("/restock", restockMedicine);

module.exports = router;