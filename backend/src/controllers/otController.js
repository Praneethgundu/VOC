const otService = require("../services/otService");
const auditService = require("../services/auditService");

const scheduleProcedure = async (req, res) => {
  try {
    const procedure = await otService.scheduleProcedure(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "SCHEDULE_OT", `Scheduled OT procedure ${procedure.procedure} for ${procedure.patientName}`);
    res.status(201).json({ message: "Procedure scheduled", procedure });
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule procedure", error: error.message });
  }
};

const getProcedures = async (req, res) => {
  try {
    const procedures = await otService.getProcedures();
    res.status(200).json(procedures);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch procedures", error: error.message });
  }
};

const updateProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await otService.updateProcedure(id, req.body);
    if (!updated) return res.status(404).json({ message: "Procedure not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_OT", `Updated OT procedure ${id}`);
    res.status(200).json({ message: "Procedure updated successfully", procedure: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update procedure", error: error.message });
  }
};

const deleteProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await otService.deleteProcedure(id);
    if (!deleted) return res.status(404).json({ message: "Procedure not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "DELETE_OT", `Deleted OT procedure ${id}`);
    res.status(200).json({ message: "Procedure deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete procedure", error: error.message });
  }
};

module.exports = {
  scheduleProcedure,
  getProcedures,
  updateProcedure,
  deleteProcedure,
};
