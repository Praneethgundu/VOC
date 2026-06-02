const {
  getPatientSheet,
} = require(
  "../services/patientService"
);

exports.getPatients = async (
  req,
  res
) => {
  try {
    const { sheet } =
      await getPatientSheet();

    const patients = [];

    sheet.eachRow(
      (row, rowNumber) => {
        if (rowNumber === 1)
          return;

        patients.push({
          opNumber:
            row.getCell(1).value,
          fullName:
            row.getCell(2).value,
          age:
            row.getCell(3).value,
          gender:
            row.getCell(4).value,
          phone:
            row.getCell(5).value,
          bloodGroup:
            row.getCell(6).value,
          address:
            row.getCell(7).value,
          department:
            row.getCell(8).value,
          doctor:
            row.getCell(9).value,
          fee:
            row.getCell(10).value,
          createdAt:
            row.getCell(11).value,
        });
      }
    );

    res.json(patients);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.addPatient = async (
  req,
  res
) => {
  try {
    const {
      workbook,
      sheet,
      filePath,
    } =
      await getPatientSheet();

    sheet.addRow([
      req.body.opNumber,
      req.body.fullName,
      req.body.age,
      req.body.gender,
      req.body.phone,
      req.body.bloodGroup,
      req.body.address,
      req.body.department,
      req.body.doctor,
      req.body.fee,
      new Date().toLocaleString(),
    ]);

    await workbook.xlsx.writeFile(
      filePath
    );

    res.status(201).json({
      success: true,
      message:
        "Patient Registered Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getPatientByOP =
  async (req, res) => {
    try {
      const { sheet } =
        await getPatientSheet();

      let patient =
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
            patient = {
              opNumber:
                row.getCell(
                  1
                ).value,
              fullName:
                row.getCell(
                  2
                ).value,
              age:
                row.getCell(
                  3
                ).value,
              gender:
                row.getCell(
                  4
                ).value,
              phone:
                row.getCell(
                  5
                ).value,
            };
          }
        }
      );

      if (!patient) {
        return res
          .status(404)
          .json({
            message:
              "Patient not found",
          });
      }

      res.json(patient);
    } catch (error) {
      res.status(500).json({
        error:
          error.message,
      });
    }
  };