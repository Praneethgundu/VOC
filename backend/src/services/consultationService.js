const { getWorkbook } = require("./excelService");

const columns = [
  {
    header: "OP Number",
    key: "opNumber",
    width: 20,
  },
  {
    header: "Patient Name",
    key: "patientName",
    width: 25,
  },
  {
    header: "Doctor",
    key: "doctor",
    width: 25,
  },
  {
    header: "Diagnosis",
    key: "diagnosis",
    width: 40,
  },
  {
    header: "Prescription",
    key: "prescription",
    width: 40,
  },
  {
    header: "Consultation Date",
    key: "consultationDate",
    width: 25,
  },
];

const getConsultationSheet =
  async () => {
    const {
      workbook,
      filePath,
    } = await getWorkbook(
      "consultations.xlsx",
      "Consultations",
      columns
    );

    const sheet =
      workbook.getWorksheet(
        "Consultations"
      );

    return {
      workbook,
      sheet,
      filePath,
    };
  };

module.exports = {
  getConsultationSheet,
};