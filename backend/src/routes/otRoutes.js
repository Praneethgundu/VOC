const express = require("express");
const { scheduleProcedure, getProcedures, updateProcedure } = require("../controllers/otController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", scheduleProcedure);
router.get("/", getProcedures);
router.put("/:id/status", updateProcedure);

module.exports = router;
