const { getDispenseHistory } = require('./src/services/pharmacyService');

(async () => {
  try {
    const history = await getDispenseHistory();
    console.log("Success:", history);
  } catch (error) {
    console.error("Error:", error);
  }
})();
