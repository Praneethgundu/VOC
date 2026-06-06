const patientService = require('./src/services/patientService');
const consultationService = require('./src/services/consultationService');

console.log("patientService.createPatient:", typeof patientService.createPatient);
console.log("consultationService.addConsultation:", typeof consultationService.addConsultation);
