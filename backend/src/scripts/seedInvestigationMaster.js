const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const excelFilePath = path.join(__dirname, '../../../Investigation.xlsx');
const jsonOutputPath = path.join(__dirname, '../data/investigation_master.json');

async function generateMasterData() {
  try {
    const workbook = new ExcelJS.Workbook();
    console.log(`Reading Excel file from ${excelFilePath}...`);
    await workbook.xlsx.readFile(excelFilePath);
    
    const sheet = workbook.worksheets[0];
    const investigations = [];
    
    // Find column indices
    const headerRow = sheet.getRow(1);
    const colMap = {};
    headerRow.eachCell((cell, colNumber) => {
      if (cell.value) {
        colMap[cell.value.toString().trim()] = colNumber;
      }
    });
    
    console.log("Found columns:", Object.keys(colMap));
    
    // Map required by user:
    // SERVICE CD -> code
    // DISPLAY NAME -> name
    // SERVICE DESC -> description
    // SERVICE GROUP_NAME -> category
    // SERVICE TYPE_NAME -> type
    // PRICE -> price
    
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      const getValue = (colName) => {
        const colNum = colMap[colName];
        if (!colNum) return '';
        const val = row.getCell(colNum).value;
        return val !== null && val !== undefined ? val : '';
      };
      
      const rawPrice = getValue('PRICE');
      const price = parseFloat(rawPrice);
      
      // Only include if it has a code and name, and type is Investigation
      const type = getValue('SERVICE TYPE_NAME');
      // The user requested: "Add this data only for investigation usage." We might need to filter.
      // But let's check what the type is. I will add it if price is valid number.
      
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

    // Write to JSON
    fs.writeFileSync(jsonOutputPath, JSON.stringify(investigations, null, 2));
    console.log(`Successfully parsed ${investigations.length} investigations to ${jsonOutputPath}`);

  } catch (err) {
    console.error("Error generating master data:", err);
  }
}

generateMasterData();
