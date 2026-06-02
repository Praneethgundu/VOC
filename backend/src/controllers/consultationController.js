const {
  getConsultationSheet,
} = require(
  "../services/consultationService"
);

exports.getConsultations =
  async (req, res) => {
    try {
      const { sheet } =
        await getConsultationSheet();

      const consultations =
        [];

      sheet.eachRow(
        (row, rowNumber) => {
          if (
            rowNumber === 1
          )
            return;

          consultations.push({
            opNumber:
              row.getCell(1)
                .value,
            patientName:
              row.getCell(2)
                .value,
            doctor:
              row.getCell(3)
                .value,
            diagnosis:
              row.getCell(4)
                .value,
            prescription:
              row.getCell(5)
                .value,
            consultationDate:
              row.getCell(6)
                .value,
          });
        }
      );

      res.json(
        consultations
      );
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };

exports.addConsultation =
  async (req, res) => {
    try {
      const {
        workbook,
        sheet,
        filePath,
      } =
        await getConsultationSheet();

      sheet.addRow([
        req.body.opNumber,
        req.body.patientName,
        req.body.doctor,
        req.body.diagnosis,
        req.body.prescription,
        new Date().toLocaleString(),
      ]);

      await workbook.xlsx.writeFile(
        filePath
      );

      res.status(201).json({
        success: true,
        message:
          "Consultation Saved Successfully",
      });
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };

exports.getConsultationByOP =
  async (req, res) => {
    try {
      const { sheet } =
        await getConsultationSheet();

      let consultation =
        null;

      sheet.eachRow(
        (
          row,
          rowNumber
        ) => {
          if (
            rowNumber === 1
          )
            return;

          if (
            row.getCell(1)
              .value ===
            req.params.opNumber
          ) {
            consultation =
              {
                opNumber:
                  row.getCell(
                    1
                  ).value,
                patientName:
                  row.getCell(
                    2
                  ).value,
                doctor:
                  row.getCell(
                    3
                  ).value,
                diagnosis:
                  row.getCell(
                    4
                  ).value,
                prescription:
                  row.getCell(
                    5
                  ).value,
              };
          }
        }
      );

      if (
        !consultation
      ) {
        return res
          .status(404)
          .json({
            message:
              "Consultation not found",
          });
      }

      res.json(
        consultation
      );
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };