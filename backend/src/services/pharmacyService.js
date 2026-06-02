const { getWorkbook } = require("./excelService");

const columns = [
  {
    header: "Medicine ID",
    key: "medicineId",
    width: 20,
  },
  {
    header: "Medicine Name",
    key: "medicineName",
    width: 30,
  },
  {
    header: "Category",
    key: "category",
    width: 20,
  },
  {
    header: "Quantity",
    key: "quantity",
    width: 15,
  },
  {
    header: "Price",
    key: "price",
    width: 15,
  },
  {
    header: "Expiry Date",
    key: "expiryDate",
    width: 20,
  },
  {
    header: "Created At",
    key: "createdAt",
    width: 25,
  },
];

const getPharmacySheet =
  async () => {
    const {
      workbook,
      filePath,
    } = await getWorkbook(
      "pharmacy.xlsx",
      "Pharmacy",
      columns
    );

    const sheet =
      workbook.getWorksheet(
        "Pharmacy"
      );

    return {
      workbook,
      sheet,
      filePath,
    };
  };

module.exports = {
  getPharmacySheet,
};