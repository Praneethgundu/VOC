const pharmacyService = require("./src/services/pharmacyService");

(async () => {
  try {
    const inv = await pharmacyService.getInventory();
    console.log(inv.slice(0, 2));
  } catch (err) {
    console.error(err);
  }
})();
