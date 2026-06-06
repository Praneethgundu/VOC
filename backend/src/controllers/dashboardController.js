const dashboardService = require("../services/dashboardService");

const getAlerts = async (req, res) => {
  try {
    const alerts = await dashboardService.getSystemAlerts();
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts", error: error.message });
  }
};

module.exports = {
  getAlerts
};
