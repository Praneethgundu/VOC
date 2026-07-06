const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log('Clearing patient records...');
    
    // Delete patient-related transaction records first
    const deletedConsultations = await prisma.consultation.deleteMany({});
    console.log(`Deleted ${deletedConsultations.count} consultations.`);
    
    const deletedBills = await prisma.bill.deleteMany({});
    console.log(`Deleted ${deletedBills.count} bills.`);
    
    const deletedPharmacyDispense = await prisma.pharmacyDispense.deleteMany({});
    console.log(`Deleted ${deletedPharmacyDispense.count} pharmacy dispense records.`);
    
    const deletedInvestigationTransactions = await prisma.investigationTransaction.deleteMany({});
    console.log(`Deleted ${deletedInvestigationTransactions.count} investigation transactions.`);
    
    const deletedOTProcedures = await prisma.oTProcedure.deleteMany({});
    console.log(`Deleted ${deletedOTProcedures.count} OT procedures.`);
    
    // Delete patients last
    const deletedPatients = await prisma.patient.deleteMany({});
    console.log(`Deleted ${deletedPatients.count} patients.`);
    
    console.log('Patient data cleared successfully. Predefined data (users, pharmacy inventory, investigation master) remains intact.');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
