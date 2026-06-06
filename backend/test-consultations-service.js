const consultationService = require('./src/services/consultationService');

(async () => {
  try {
    const consultations = await consultationService.getConsultations();
    console.log("Total consultations:", consultations.length);
    console.log("First consultation (newest):", consultations[0]);
  } catch (error) {
    console.error("Error fetching consultations:", error);
  }
})();
