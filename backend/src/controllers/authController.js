const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByUsername } = require("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key";

// Helper function to generate tokens
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log(`[AUTH] Incoming login request - Username: ${username}, Role: ${role}`);

    if (!username || !password || !role) {
      console.log("[AUTH] Failure: Missing username, password, or role");
      return res.status(400).json({ message: "Username, password, and role are required" });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      console.log(`[AUTH] Failure: User not found for username: ${username}`);
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    console.log(`[AUTH] User found - ID: ${user.id}, DbRole: ${user.role}`);

    if (user.role.toUpperCase() !== role.toUpperCase()) {
      console.log(`[AUTH] Failure: Role mismatch - Expected: ${user.role}, Received: ${role}`);
      return res.status(401).json({ message: "Invalid role selected" });
    }

    if (!user.is_active || user.is_active === "false" || user.is_active === false) {
      console.log(`[AUTH] Failure: User account disabled - Username: ${username}`);
      return res.status(401).json({ message: "User account is disabled" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`[AUTH] Password comparison result: ${isMatch}`);

    if (!isMatch) {
      console.log(`[AUTH] Failure: Password mismatch for user: ${username}`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const tokens = generateTokens(user);
    console.log(`[AUTH] Success: Tokens generated for user: ${username}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("[AUTH] Login error exception:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

exports.profile = async (req, res) => {
  try {
    const user = await getUserByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
      }

      const user = await getUserByUsername(decoded.username);
      if (!user || !user.is_active || user.is_active === "false" || user.is_active === false) {
        return res.status(401).json({ message: "User account is invalid or disabled" });
      }

      const tokens = generateTokens(user);
      res.json({ success: true, ...tokens });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
