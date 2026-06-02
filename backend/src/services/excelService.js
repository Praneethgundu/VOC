const ExcelJS = require("exceljs");
const path = require("path");

const getWorkbook = async (
  fileName,
  sheetName,
  columns
) => {
  const workbook =
    new ExcelJS.Workbook();

  const filePath = path.join(
    __dirname,
    "../data",
    fileName
  );

  try {
    await workbook.xlsx.readFile(
      filePath
    );
  } catch (error) {
    const sheet =
      workbook.addWorksheet(
        sheetName
      );

    sheet.columns = columns;

    await workbook.xlsx.writeFile(
      filePath
    );
  }

  return {
    workbook,
    filePath,
  };
};

module.exports = {
  getWorkbook,
};