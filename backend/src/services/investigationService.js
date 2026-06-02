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
    header: "Test Name",
    key: "testName",
    width: 25,
  },
  {
    header: "Amount",
    key: "amount",
    width: 15,
  },
  {
    header: "Status",
    key: "status",
    width: 15,
  },
  {
    header: "Ordered Date",
    key: "orderedDate",
    width: 25,
  },
];

const getInvestigationSheet =
  async () => {
    const {
      workbook,
      filePath,
    } = await getWorkbook(
      "investigations.xlsx",
      "Investigations",
      columns
    );

    const sheet =
      workbook.getWorksheet(
        "Investigations"
      );

    return {
      workbook,
      sheet,
      filePath,
    };
  };

module.exports = {
  getInvestigationSheet,
};