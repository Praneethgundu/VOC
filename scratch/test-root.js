const fs = require("fs");
const path = require("path");

function findProjectRoot() {
  let currentDir = __dirname;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  return process.cwd();
}

console.log("Resolved project root:", findProjectRoot());
console.log("process.cwd():", process.cwd());
