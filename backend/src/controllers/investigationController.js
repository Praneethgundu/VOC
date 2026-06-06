const investigationService = require("../services/investigationService");
const investigationMasterService = require("../services/investigationMasterService");
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

const getInvestigationMaster = async (req, res) => {
  try {
    const masterData = await investigationMasterService.getInvestigationMaster();
    res.status(200).json(masterData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch investigation master data", error: error.message });
  }
};

const updateInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await investigationService.updateInvestigation(id, req.body);
    if (!updated) return res.status(404).json({ message: "Test not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_TEST", `Updated test ${id}`);
    res.status(200).json({ message: "Test updated successfully", investigation: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update test", error: error.message });
  }
};

const deleteInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await investigationService.deleteInvestigation(id);
    if (!deleted) return res.status(404).json({ message: "Test not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "DELETE_TEST", `Deleted test ${id}`);
    res.status(200).json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete test", error: error.message });
  }
};

module.exports = {
  createInvestigation,
  getInvestigations,
  getInvestigationMaster,
  updateInvestigation,
  deleteInvestigation,
};