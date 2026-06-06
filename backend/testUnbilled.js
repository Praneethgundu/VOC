const billingService = require("./src/services/billingService");

(async () => {
  try {
    const unbilled = await billingService.getUnbilledPatients();
    console.log("Unbilled patients:", unbilled.length);
  } catch (err) {
    console.error("Error:", err);
  }
})();
