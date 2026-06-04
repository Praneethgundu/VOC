const pharmacyService = require("../services/pharmacyService");
const auditService = require("../services/auditService");

const getInventory = async (req, res) => {
  try {
    const inventory = await pharmacyService.getInventory();
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory", error: error.message });
  }
};

const getDispenseHistory = async (req, res) => {
  try {
    const history = await pharmacyService.getDispenseHistory();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dispense history", error: error.message });
  }
};

const addMedicine = async (req, res) => {
  try {
    const medicine = await pharmacyService.addMedicine(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "ADD_MEDICINE", `Added medicine ${medicine.medicineName}`);
    res.status(201).json({ message: "Medicine added", medicine });
  } catch (error) {
    res.status(500).json({ message: "Failed to add medicine", error: error.message });
  }
};

const dispenseMedicine = async (req, res) => {
  try {
    const record = await pharmacyService.dispenseMedicine(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "DISPENSE_MEDICINE", `Dispensed medicine ${record.medicineId} to OP ${record.opNumber}`);
    res.status(200).json({ message: "Medicine dispensed", record });
  } catch (error) {
    res.status(500).json({ message: "Failed to dispense medicine", error: error.message });
  }
};

const restockMedicine = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;
    const updated = await pharmacyService.updateStock(medicineId, Number(quantity));
    if (!updated) return res.status(404).json({ message: "Medicine not found" });
    await auditService.logAction(req.user?.username, req.user?.role, "RESTOCK_MEDICINE", `Restocked medicine ${medicineId} with ${quantity} units`);
    res.status(200).json({ message: "Medicine restocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to restock medicine", error: error.message });
  }
};

module.exports = {
  getInventory,
  addMedicine,
  dispenseMedicine,
  restockMedicine,
  getDispenseHistory,
};