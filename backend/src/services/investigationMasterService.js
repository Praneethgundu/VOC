const { getHospitalWorkbook, releaseLock } = require('./excelService');

const getInvestigationMaster = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Investigation_Master");
  const investigations = [];
  
  if (!sheet) {
    releaseLock();
    return [];
  }
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    
    // excelService.js enforces the columns:
    // 1: Investigation Code
    // 2: Investigation Name
    // 3: Description
    // 4: Category
    // 5: Type
    // 6: Price
    
    const code = row.getCell(1).value;
    const name = row.getCell(2).value;
    const desc = row.getCell(3).value;
    const cat = row.getCell(4).value;
    const type = row.getCell(5).value;
    const priceVal = row.getCell(6).value;
    
    const invName = name ? String(name).trim() : '';
    
    if (invName && invName !== 'undefined') {
      investigations.push({
        code: code ? String(code).trim() : 'INV-' + rowNumber,
        name: invName,
        description: desc ? String(desc).trim() : '',
        category: cat ? String(cat).trim() : 'General',
        type: type ? String(type).trim() : 'Lab',
        price: isNaN(parseFloat(priceVal)) ? 0 : parseFloat(priceVal)
      });
    }
  });

  releaseLock();
  return investigations;
};

module.exports = {
  getInvestigationMaster
};
