const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '.next', 'static');
const destDir = path.join(__dirname, '_next', 'static');

function copyDirectorySync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (fs.existsSync(srcDir)) {
    console.log('Copying static assets for Hostinger compatibility...');
    // Clean up destination if it exists to avoid stale files
    if (fs.existsSync(path.join(__dirname, '_next'))) {
      fs.rmSync(path.join(__dirname, '_next'), { recursive: true, force: true });
    }
    copyDirectorySync(srcDir, destDir);
    console.log('Successfully copied .next/static to _next/static');
  } else {
    console.log('Source directory .next/static does not exist. Skipping copy.');
  }
} catch (error) {
  console.error('Error copying static assets:', error);
}
