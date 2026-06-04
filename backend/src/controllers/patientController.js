const patientService = require("../services/patientService");
const auditService = require("../services/auditService");

const createPatient = async (req, res) => {
  try {
    const patient = await patientService.createPatient(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "REGISTER_PATIENT", `Registered patient ${patient.fullName} (${patient.opNumber})`);
    res.status(201).json({ message: "Patient registered successfully", patient });
  } catch (error) {
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

module.exports = {
  createPatient,
  getAllPatients,
};