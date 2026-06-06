const pharmacyService = require("./src/services/pharmacyService");

(async () => {
  try {
    const updated = await pharmacyService.updateStock('MED-26746D', 10);
    console.log("Updated:", updated);
  } catch(e) {
    console.error(e);
  }
})();
