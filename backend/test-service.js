const patientService = require('./src/services/patientService');

(async () => {
  try {
    const newPatient = await patientService.createPatient({
      fullName: 'Test User',
      age: 30,
      gender: 'Male',
      phone: '1234567890',
      bloodGroup: 'O+',
      department: 'General',
      doctor: 'Dr. Smith',
      complaint: 'Fever',
      address: '123 Main St'
    });
    console.log("Success:", newPatient);
  } catch (error) {
    console.error("Error creating patient:");
    console.error(error);
  }
})();
