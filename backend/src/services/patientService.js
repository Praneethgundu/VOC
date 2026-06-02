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

const getPatientSheet =
  async () => {
    const {
      workbook,
      filePath,
    } = await getWorkbook(
      "patients.xlsx",
      "Patients",
      columns
    );

    const sheet =
      workbook.getWorksheet(
        "Patients"
      );

    return {
      workbook,
      sheet,
      filePath,
    };
  };

module.exports = {
  getPatientSheet,
};