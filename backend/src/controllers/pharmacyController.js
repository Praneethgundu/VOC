const {
  getPharmacySheet,
} = require(
  "../services/pharmacyService"
);

exports.getMedicines =
  async (req, res) => {
    try {
      const { sheet } =
        await getPharmacySheet();

      const medicines = [];

      sheet.eachRow(
        (row, rowNumber) => {
          if (rowNumber === 1) return;

          medicines.push({
            medicineId:
              row.getCell(1).value,
            medicineName:
              row.getCell(2).value,
            category:
              row.getCell(3).value,
            quantity:
              row.getCell(4).value,
            price:
              row.getCell(5).value,
            expiryDate:
              row.getCell(6).value,
            createdAt:
              row.getCell(7).value,
          });
        }
      );

      res.json(medicines);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  };

exports.addMedicine =
  async (req, res) => {
    try {
      const {
        workbook,
        sheet,
        filePath,
      } =
        await getPharmacySheet();

      sheet.addRow([
        req.body.medicineId,
        req.body.medicineName,
        req.body.category,
        req.body.quantity,
        req.body.price,
        req.body.expiryDate,
        new Date().toLocaleString(),
      ]);

      await workbook.xlsx.writeFile(
        filePath
      );

      res.status(201).json({
        success: true,
        message:
          "Medicine Added Successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  };

exports.updateStock =
  async (req, res) => {
    try {
      const {
        workbook,
        sheet,
        filePath,
      } =
        await getPharmacySheet();

      let found = false;

      sheet.eachRow(
        (row, rowNumber) => {
          if (rowNumber === 1) return;

          if (
            row.getCell(1).value ===
            req.params.medicineId
          ) {
            row.getCell(4).value =
              req.body.quantity;

            found = true;
          }
        }
      );

      if (!found) {
        return res
          .status(404)
          .json({
            message:
              "Medicine not found",
          });
      }

      await workbook.xlsx.writeFile(
        filePath
      );

      res.json({
        success: true,
        message:
          "Stock Updated",
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  };