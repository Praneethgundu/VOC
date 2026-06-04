const investigationService = require("../services/investigationService");
const auditService = require("../services/auditService");

const createInvestigation = async (req, res) => {
  try {
    const investigation = await investigationService.addInvestigation(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "ORDER_TEST", `Test ${investigation.testName} ordered for OP ${investigation.opNumber}`);
    res.status(201).json({ message: "Test ordered", investigation });
  } catch (error) {
    res.status(500).json({ message: "Failed to order test", error: error.message });
  }
};

const getInvestigations = async (req, res) => {
  try {
    const investigations = await investigationService.getInvestigations();
    res.status(200).json(investigations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch investigations", error: error.message });
  }
};

const updateInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result } = req.body;
    await investigationService.updateInvestigationStatus(id, status, result);
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_TEST", `Updated test ${id} status to ${status}`);
    res.status(200).json({ message: "Test updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update test", error: error.message });
  }
};

module.exports = {
  createInvestigation,
  getInvestigations,
  updateInvestigation,
};