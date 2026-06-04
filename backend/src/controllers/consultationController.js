const consultationService = require("../services/consultationService");
const auditService = require("../services/auditService");

const createConsultation = async (req, res) => {
  try {
    const consultation = await consultationService.addConsultation(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "NEW_CONSULTATION", `Consultation added for OP ${consultation.opNumber}`);
    res.status(201).json({ message: "Consultation created", consultation });
  } catch (error) {
    res.status(500).json({ message: "Failed to create consultation", error: error.message });
  }
};

const getConsultations = async (req, res) => {
  try {
    const consultations = await consultationService.getConsultations();
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch consultations", error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await consultationService.updateConsultationStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_CONSULTATION_STATUS", `Consultation ${id} status updated to ${status}`);
    res.status(200).json({ message: "Status updated", updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

module.exports = {
  createConsultation,
  getConsultations,
  updateStatus,
};