const { getWorkbook } = require("./excelService");

const columns = [
  { header: "Timestamp", key: "timestamp", width: 25 },
  { header: "User", key: "username", width: 20 },
  { header: "Role", key: "role", width: 15 },
  { header: "Action", key: "action", width: 20 },
  { header: "Details", key: "details", width: 50 },
];

const getAuditSheet = async () => {
  const { workbook, filePath } = await getWorkbook("audit_logs.xlsx", "Audit", columns);
  const sheet = workbook.getWorksheet("Audit");
  return { workbook, sheet, filePath };
};

const logAction = async (username, role, action, details) => {
  try {
    const { workbook, sheet, filePath } = await getAuditSheet();
    const timestamp = new Date().toISOString();
    
    sheet.addRow({
      timestamp,
      username: username || "System",
      role: role || "System",
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
    });
    
    await workbook.xlsx.writeFile(filePath);
    return true;
  } catch (error) {
    console.error("[AUDIT] Failed to log action:", error);
    return false;
  }
};

const getLogs = async () => {
  try {
    const { sheet } = await getAuditSheet();
    const logs = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      logs.push({
        timestamp: row.getCell(1).value,
        username: row.getCell(2).value,
        role: row.getCell(3).value,
        action: row.getCell(4).value,
        details: row.getCell(5).value,
      });
    });
    return logs.reverse(); // Newest first
  } catch (error) {
    console.error("[AUDIT] Failed to get logs:", error);
    return [];
  }
};

module.exports = {
  logAction,
  getLogs,
};
