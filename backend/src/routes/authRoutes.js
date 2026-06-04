const express = require("express");
const { login, logout, profile, refreshToken } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", authMiddleware, profile);

module.exports = router;
