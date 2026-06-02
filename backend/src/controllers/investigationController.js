const {
  getInvestigationSheet,
} = require(
  "../services/investigationService"
);

exports.getInvestigations =
  async (req, res) => {
    try {
      const { sheet } =
        await getInvestigationSheet();

      const investigations = [];

      sheet.eachRow(
        (row, rowNumber) => {
          if (rowNumber === 1) return;

          investigations.push({
            opNumber:
              row.getCell(1).value,
            patientName:
              row.getCell(2).value,
            doctor:
              row.getCell(3).value,
            testName:
              row.getCell(4).value,
            amount:
              row.getCell(5).value,
            status:
              row.getCell(6).value,
            orderedDate:
              row.getCell(7).value,
          });
        }
      );

      res.json(
        investigations
      );
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };

exports.addInvestigation =
  async (req, res) => {
    try {
      const {
        workbook,
        sheet,
        filePath,
      } =
        await getInvestigationSheet();

      sheet.addRow([
        req.body.opNumber,
        req.body.patientName,
        req.body.doctor,
        req.body.testName,
        req.body.amount,
        req.body.status,
        new Date().toLocaleString(),
      ]);

      await workbook.xlsx.writeFile(
        filePath
      );

      res.status(201).json({
        success: true,
        message:
          "Investigation Saved Successfully",
      });
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };

exports.getInvestigationByOP =
  async (req, res) => {
    try {
      const { sheet } =
        await getInvestigationSheet();

      const results = [];

      sheet.eachRow(
        (row, rowNumber) => {
          if (rowNumber === 1) return;

          if (
            row.getCell(1).value ===
            req.params.opNumber
          ) {
            results.push({
              opNumber:
                row.getCell(1).value,
              patientName:
                row.getCell(2).value,
              doctor:
                row.getCell(3).value,
              testName:
                row.getCell(4).value,
              amount:
                row.getCell(5).value,
              status:
                row.getCell(6).value,
              orderedDate:
                row.getCell(7).value,
            });
          }
        }
      );

      res.json(results);
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };

exports.updateStatus =
  async (req, res) => {
    try {
      const {
        workbook,
        sheet,
        filePath,
      } =
        await getInvestigationSheet();

      let found = false;

      sheet.eachRow(
        (row, rowNumber) => {
          if (rowNumber === 1) return;

          if (
            row.getCell(1).value ===
            req.params.opNumber
          ) {
            row.getCell(6).value =
              req.body.status;

            found = true;
          }
        }
      );

      if (!found) {
        return res
          .status(404)
          .json({
            message:
              "Investigation not found",
          });
      }

      await workbook.xlsx.writeFile(
        filePath
      );

      res.json({
        success: true,
        message:
          "Status Updated Successfully",
      });
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };