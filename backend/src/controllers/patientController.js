const patientService = require("../services/patientService");
const auditService = require("../services/auditService");

const createPatient = async (req, res) => {
  try {
    console.log("[REGISTRATION REQUEST RECEIVED]");
    console.log(JSON.stringify(req.body, null, 2));

    const patient = await patientService.createPatient(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "REGISTER_PATIENT", `Registered patient ${patient.fullName} (${patient.opNumber})`);
    
    // The response is ONLY sent after patientService.createPatient completely succeeds
    res.status(201).json({ message: "Patient registered successfully", patient });
  } catch (error) {
    console.error("[REGISTRATION FAILED]", error);
    if (error.code === 'EBUSY') {
      return res.status(409).json({ message: "The database file (Excel) is currently open in another program. Please close Microsoft Excel and try again." });
    }
    res.status(500).json({ message: "Failed to register patient", error: error.message });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await patientService.getAllPatients();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients", error: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { opNumber } = req.params;
    const updated = await patientService.updatePatient(opNumber, req.body);
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_PATIENT", `Updated patient ${opNumber}`);
    res.status(200).json({ message: "Patient updated successfully", patient: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update patient", error: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { opNumber } = req.params;
    const deleted = await patientService.deletePatient(opNumber);
    if (!deleted) return res.status(404).json({ message: "Patient not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "DELETE_PATIENT", `Deleted patient ${opNumber}`);
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete patient", error: error.message });
  }
};

const getPatientRecord = async (req, res) => {
  try {
    const { opNumber } = req.params;
    const record = await patientService.getPatientRecord(opNumber);
    if (!record) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patient record", error: error.message });
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  getPatientRecord
};