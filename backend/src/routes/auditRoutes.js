const express = require("express");
const { getLogs } = require("../controllers/auditController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getLogs);

module.exports = router;
