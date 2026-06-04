const auditService = require("../services/auditService");

const getLogs = async (req, res) => {
  try {
    const logs = await auditService.getLogs();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
};

module.exports = {
  getLogs,
};
