const {
  getWorkbook,
} = require("./excelService");

const columns = [
  {
    header: "OP Number",
    key: "opNumber",
    width: 20,
  },
  {
    header: "Full Name",
    key: "fullName",
    width: 25,
  },
  {
    header: "Age",
    key: "age",
    width: 10,
  },
  {
    header: "Gender",
    key: "gender",
    width: 15,
  },
  {
    header: "Phone",
    key: "phone",
    width: 20,
  },
  {
    header: "Blood Group",
    key: "bloodGroup",
    width: 15,
  },
  {
    header: "Address",
    key: "address",
    width: 30,
  },
  {
    header: "Department",
    key: "department",
    width: 20,
  },
  {
    header: "Doctor",
    key: "doctor",
    width: 20,
  },
  {
    header: "Fee",
    key: "fee",
    width: 15,
  },
  {
    header: "Created At",
    key: "createdAt",
    width: 25,
  },
];

const getPatientSheet = async () => {
  const { workbook, filePath } = await getWorkbook("patients.xlsx", "Patients", columns);
  let sheet = workbook.getWorksheet("Patients");
  if (!sheet) {
    sheet = workbook.addWorksheet("Patients");
    sheet.columns = columns;
    await workbook.xlsx.writeFile(filePath);
  }
  return { workbook, sheet, filePath };
};

const createPatient = async (patientData) => {
  const { workbook, sheet, filePath } = await getPatientSheet();
  
  // Generate OP Number OP/YYYY/XXX
  const year = new Date().getFullYear();
  const count = sheet.rowCount > 1 ? sheet.rowCount : 1;
  const opNumber = `OP/${year}/${String(count).padStart(3, '0')}`;
  
  const newPatient = {
    opNumber,
    fullName: patientData.fullName,
    age: patientData.age,
    gender: patientData.gender,
    phone: patientData.phone,
    bloodGroup: patientData.bloodGroup,
    address: patientData.address,
    department: patientData.department,
    doctor: patientData.doctor,
    fee: patientData.fee,
    createdAt: new Date().toISOString(),
  };
  
  sheet.addRow(newPatient);
  await workbook.xlsx.writeFile(filePath);
  return newPatient;
};

const getAllPatients = async () => {
  const { sheet } = await getPatientSheet();
  const patients = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    patients.push({
      opNumber: row.getCell(1).value,
      fullName: row.getCell(2).value,
      age: row.getCell(3).value,
      gender: row.getCell(4).value,
      phone: row.getCell(5).value,
      bloodGroup: row.getCell(6).value,
      address: row.getCell(7).value,
      department: row.getCell(8).value,
      doctor: row.getCell(9).value,
      fee: row.getCell(10).value,
      createdAt: row.getCell(11).value,
    });
  });
  
  return patients.reverse(); // Newest first
};

module.exports = {
  getPatientSheet,
  createPatient,
  getAllPatients,
};