const express = require("express");
const { scheduleProcedure, getProcedures, updateProcedure, deleteProcedure } = require("../controllers/otController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", scheduleProcedure);
router.get("/", getProcedures);
router.put("/:id/status", updateProcedure); // legacy
router.put("/:id", updateProcedure);
router.delete("/:id", deleteProcedure);

module.exports = router;
