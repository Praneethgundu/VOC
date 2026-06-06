const { getHospitalWorkbook, saveHospitalWorkbook, releaseLock } = require("./excelService");
const bcrypt = require("bcrypt");

const columns = [
  { header: "ID", key: "id", width: 36 },
  { header: "Username", key: "username", width: 20 },
  { header: "Password Hash", key: "password_hash", width: 60 },
  { header: "Role", key: "role", width: 15 },
  { header: "Is Active", key: "is_active", width: 10 },
  { header: "Created At", key: "createdAt", width: 25 },
  { header: "Updated At", key: "updatedAt", width: 25 },
];

const getUserSheet = async () => {
  const workbook = await getHospitalWorkbook();
  const sheet = workbook.getWorksheet("Users");
  return { workbook, sheet };
};

const getUserByUsername = async (username) => {
  const { sheet } = await getUserSheet();
  let user = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    if (row.getCell(2).value === username) {
      user = {
        id: row.getCell(1).value,
        username: row.getCell(2).value,
        password_hash: row.getCell(3).value,
        role: row.getCell(4).value,
        is_active: row.getCell(5).value,
        createdAt: row.getCell(6).value,
        updatedAt: row.getCell(7).value,
      };
    }
  });

  releaseLock();
  return user;
};

const createUser = async (id, username, password, role) => {
  const { workbook, sheet } = await getUserSheet();
  
  // Check if username already exists
  let exists = false;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.getCell(2).value === username) {
      exists = true;
    }
  });

  if (exists) {
    releaseLock();
    throw new Error("Username already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const now = new Date().toLocaleString();

  sheet.addRow([
    id,
    username,
    password_hash,
    role,
    true, // is_active
    now,  // createdAt
    now   // updatedAt
  ]);

  await saveHospitalWorkbook(workbook);
  
  return {
    id,
    username,
    role,
    is_active: true
  };
};

module.exports = {
  getUserSheet,
  getUserByUsername,
  createUser,
};
