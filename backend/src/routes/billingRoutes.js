const express = require("express");
const { createBill, getBills, getUnbilled, updatePayment, updateBill, deleteBill } = require("../controllers/billingController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/unbilled", getUnbilled);
router.post("/", createBill);
router.get("/", getBills);
router.get("", getBills); // Catch without trailing slash just in case
router.put("/:id/payment", updatePayment); // legacy
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

module.exports = router;
