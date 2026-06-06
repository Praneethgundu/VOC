const ExcelJS = require('exceljs');
const path = require('path');

const excelFilePath = path.join(__dirname, '..', 'Investigation.xlsx');

async function testParse() {
  try {
    const workbook = new ExcelJS.Workbook();
    console.log("Reading file from:", excelFilePath);
    await workbook.xlsx.readFile(excelFilePath);
    
    const sheet = workbook.worksheets[0];
    const investigations = [];
    
    const headerRow = sheet.getRow(1);
    const colMap = {};
    headerRow.eachCell((cell, colNumber) => {
      if (cell.value) {
        colMap[cell.value.toString().trim()] = colNumber;
      }
    });
    
    console.log("Column Map:", colMap);
    
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      
      const getValue = (colName) => {
        const colNum = colMap[colName];
        if (!colNum) return '';
        const val = row.getCell(colNum).value;
        return val !== null && val !== undefined ? val : '';
      };
      
      const rawPrice = getValue('PRICE');
      const price = parseFloat(rawPrice);
      const type = getValue('SERVICE TYPE_NAME');
      
      const inv = {
        code: String(getValue('SERVICE CD')),
        name: String(getValue('DISPLAY NAME')),
        description: String(getValue('SERVICE DESC')),
        category: String(getValue('SERVICE GROUP_NAME')),
        type: String(type),
        price: isNaN(price) ? 0 : price
      };
      
      if (inv.code && inv.name) {
        investigations.push(inv);
      }
    });

    console.log("Parsed investigations count:", investigations.length);
    if (investigations.length > 0) {
      console.log("First item:", investigations[0]);
    }

  } catch (err) {
    console.error("Error parsing:", err);
  }
}

testParse();
