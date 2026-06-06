const ExcelJS = require('exceljs');
const path = require('path');

async function checkData() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, 'src', 'data', 'hospital-data.xlsx'));
  
  const pSheet = workbook.getWorksheet('Patients');
  console.log("Total Patients:", pSheet.rowCount - 1);
  const lastP = pSheet.getRow(pSheet.rowCount).values;
  console.log("Last Patient OP:", lastP[2], "Name:", lastP[3]);

  const cSheet = workbook.getWorksheet('Consultations');
  console.log("Total Consultations:", cSheet ? cSheet.rowCount - 1 : 0);
  if (cSheet && cSheet.rowCount > 1) {
    const lastC = cSheet.getRow(cSheet.rowCount).values;
    console.log("Last Consultation OP:", lastC[3], "Status:", lastC[11]);
  }
}

checkData().catch(console.error);
