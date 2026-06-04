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
    const { status } = req.body;
    await otService.updateProcedureStatus(id, status);
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_OT", `Updated OT procedure ${id} status to ${status}`);
    res.status(200).json({ message: "Procedure updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update procedure", error: error.message });
  }
};

module.exports = {
  scheduleProcedure,
  getProcedures,
  updateProcedure,
};
