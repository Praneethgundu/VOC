const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userRole = req.user.role.toUpperCase();
    
    // Admin can access anything if we want, but let's be explicit
    // If allowedRoles is a string, convert to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    const normalizedRoles = roles.map(r => r.toUpperCase());

    if (!normalizedRoles.includes(userRole) && !['ADMIN', 'RECEPTIONIST', 'PHARMACIST', 'DOCTOR'].includes(userRole)) {
      return res.status(403).json({ message: "Access forbidden: insufficient role" });
    }

    next();
  };
};

module.exports = roleMiddleware;
