const { getHospitalWorkbook, saveHospitalWorkbook } = require("./src/services/excelService");

(async () => {
  try {
    const wb = await getHospitalWorkbook();
    const sheet = wb.getWorksheet("Pharmacy");
    if (!sheet) return;
    
    // Find rows where Patient ID is actually a Medicine ID like 'MED...'
    // and delete them.
    const rowsToDelete = [];
    sheet.eachRow((row, r) => {
      if (r > 1) {
        const idVal = row.getCell(1).value;
        const val = row.getCell(2).value; // Patient ID column
        if (!idVal || (typeof val === 'string' && val.startsWith('MED'))) {
          rowsToDelete.push(r);
        }
      }
    });
    
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      sheet.spliceRows(rowsToDelete[i], 1);
    }
    
    if (rowsToDelete.length > 0) {
      await saveHospitalWorkbook(wb);
      console.log(`Deleted ${rowsToDelete.length} invalid rows from Pharmacy sheet.`);
    } else {
      console.log("No bad data found.");
    }
  } catch (err) {
    console.error(err);
  }
})();
