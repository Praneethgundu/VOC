const billingService = require("../services/billingService");
const auditService = require("../services/auditService");

const createBill = async (req, res) => {
  try {
    const bill = await billingService.createBill(req.body);
    await auditService.logAction(req.user?.username, req.user?.role, "CREATE_BILL", `Created bill ${bill.id} for OP ${bill.opNumber}`);
    res.status(201).json({ message: "Bill created", bill });
  } catch (error) {
    res.status(500).json({ message: "Failed to create bill", error: error.message });
  }
};

const getBills = async (req, res) => {
  try {
    const bills = await billingService.getBills();
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bills", error: error.message });
  }
};

const getUnbilled = async (req, res) => {
  try {
    const unbilled = await billingService.getUnbilledPatients();
    res.status(200).json(unbilled);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unbilled patients", error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await billingService.updatePaymentStatus(id, status);
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_BILL", `Updated bill ${id} status to ${status}`);
    res.status(200).json({ message: "Bill payment updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update bill", error: error.message });
  }
};

const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await billingService.updateBill(id, req.body);
    if (!updated) return res.status(404).json({ message: "Bill not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "UPDATE_BILL", `Updated bill ${id}`);
    res.status(200).json({ message: "Bill updated successfully", bill: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update bill", error: error.message });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await billingService.deleteBill(id);
    if (!deleted) return res.status(404).json({ message: "Bill not found" });
    
    await auditService.logAction(req.user?.username, req.user?.role, "DELETE_BILL", `Deleted bill ${id}`);
    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete bill", error: error.message });
  }
};

module.exports = {
  createBill,
  getBills,
  getUnbilled,
  updatePayment,
  updateBill,
  deleteBill,
};
