const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, "../data");

async function clearData() {
  const files = [
    'patients.xlsx',
    'consultations.xlsx',
    'investigations.xlsx',
    'billing.xlsx',
    'ot_procedures.xlsx',
    'pharmacy.xlsx',
    'inventory.xlsx',
    'audit_logs.xlsx'
  ];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];
    
    // Keep header row (1), delete the rest
    if (sheet.rowCount > 1) {
      sheet.spliceRows(2, sheet.rowCount - 1);
    }
    
    await workbook.xlsx.writeFile(filePath);
    console.log(`Cleared data from ${file}`);
  }
}

clearData().then(() => console.log("All demo data cleared."));
