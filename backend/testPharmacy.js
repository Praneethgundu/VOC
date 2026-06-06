const { getHospitalWorkbook } = require("./src/services/excelService");

(async () => {
  try {
    const wb = await getHospitalWorkbook();
    const sheet = wb.getWorksheet("Pharmacy");
    if (!sheet) {
      console.log("No Pharmacy sheet");
      return;
    }
    const rawRows = [];
    sheet.eachRow((row, r) => {
        if(r <= 3) rawRows.push(row.values);
    });
    console.log(rawRows);
  } catch (err) {
    console.error(err);
  }
})();
