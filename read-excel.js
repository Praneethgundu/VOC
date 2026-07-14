const xlsx = require('xlsx');

function searchExcel(file, term) {
  try {
    const workbook = xlsx.readFile(file);
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      const found = data.filter(row => row.join(' ').toLowerCase().includes(term));
      if (found.length > 0) {
        console.log(`Found in ${file} - Sheet: ${sheetName}`);
        found.forEach(row => console.log(row.join(' | ')));
      }
    });
  } catch(e) {
  }
}

searchExcel('Investigation.xlsx', 'dressing');
searchExcel('Complete_XRay_Price_List (1).xlsx', 'dressing');
searchExcel('Complete_XRay_Price_List (1).xlsx', 'minor');

// Also print the end of the X-Ray Price List sheet
const wb = xlsx.readFile('Complete_XRay_Price_List (1).xlsx');
const sheet = wb.Sheets['X-Ray Price List'];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
console.log('\n--- End of X-Ray Price List ---');
data.slice(-50).forEach(row => console.log(row.join(' | ')));

