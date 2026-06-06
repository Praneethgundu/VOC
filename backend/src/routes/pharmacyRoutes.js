const express = require("express");
const { getInventory, addMedicine, dispenseMedicine, restockMedicine, getDispenseHistory, updateMedicine, deleteMedicine } = require("../controllers/pharmacyController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/inventory", getInventory);
router.get("/dispense-history", getDispenseHistory);
router.post("/inventory", addMedicine);
router.put("/inventory/:id", updateMedicine);
router.delete("/inventory/:id", deleteMedicine);
router.post("/dispense", dispenseMedicine);
router.post("/restock", restockMedicine); // legacy

module.exports = router;