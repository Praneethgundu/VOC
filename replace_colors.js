const fs = require('fs');
const path = require('path');

const mappings = {
  // Primary Dark (Sidebar, Headings)
  '#800020': '#0F172A',
  '#5C0018': '#0F172A',
  '#6B0019': '#0F172A',
  '#900015': '#0F172A',
  'rgba(128,0,32': 'rgba(15,23,42',
  'rgba(92,0,24': 'rgba(15,23,42',

  // Primary / Main Text
  '#1A2332': '#1E293B',

  // Primary Light
  '#A32845': '#334155',
  '#7C1414': '#334155',

  // Accents & Buttons
  '#E12D45': '#2563EB',
  '#C01D35': '#1D4ED8', // hover accent
  '#C82239': '#1D4ED8', // hover accent
  '#C9263D': '#1D4ED8', // hover accent
  '#FF5A72': '#3B82F6', // light accent
  'rgba(225,45,69': 'rgba(37,99,235',

  // Muted / Secondary Text
  '#6B7280': '#64748B',
  '#9CA3AF': '#64748B',
  '#4B5563': '#64748B',

  // Borders & Dividers
  '#ECECEC': '#E2E8F0',
  '#E5E7EB': '#E2E8F0',

  // Main Background
  '#FDF8F8': '#F8FAFC',
  '#F5F5F5': '#F8FAFC',
  '#F9FAFB': '#F8FAFC',

  // Success / OK
  '#16A34A': '#059669',
  '#15803D': '#047857',
  '#137333': '#047857',
  '#10B981': '#059669',
  '#F0FDF4': '#ECFDF5',
  '#DCFCE7': '#ECFDF5',
  '#E6F4EA': '#ECFDF5',
  '#BBF7D0': '#ECFDF5',

  // Warning
  '#D97706': '#92400E',
  '#F59E0B': '#92400E',
  '#B45309': '#92400E',
  '#CA8A04': '#92400E',
  '#FFFBEB': '#FFFBEB',
  '#FEF3C7': '#FFFBEB',
  '#FEF9C3': '#FFFBEB',
  '#FDE68A': '#FDE68A',

  // Error / Danger
  '#EF4444': '#991B1B',
  '#DC2626': '#991B1B',
  '#9E1D1D': '#991B1B',
  '#FEE2E2': '#FEE2E2',
  '#FFF4F4': '#FEE2E2',
  '#FEF2F2': '#FEE2E2',
  '#FDF6F6': '#FEE2E2',
  '#FBEAEA': '#FEE2E2',
  '#F5E8E8': '#FEE2E2',
  '#F0D5D5': '#FEE2E2',
  '#F0D0D0': '#FEE2E2',
  '#FFE0E4': '#FEE2E2',
  '#FECACA': '#FEE2E2',
  '#FCA5A5': '#FEE2E2',

  // Info
  '#EFF6FF': '#DBEAFE',
  '#DBEAFE': '#DBEAFE',
  '#BFDBFE': '#DBEAFE',
  '#E0F2FE': '#DBEAFE',
  '#F0F9FF': '#DBEAFE',
};

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (
      fullPath.endsWith('.tsx') ||
      fullPath.endsWith('.ts') ||
      fullPath.endsWith('.css') ||
      fullPath.endsWith('.js')
    ) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const [oldColor, newColor] of Object.entries(mappings)) {
        // Create regex to match case insensitively
        const regex = new RegExp(oldColor.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, newColor);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk('./app');
walk('./components');
walk('./lib');
walk('./src'); // Just in case
const rootFiles = ['tailwind.config.js'];
for (const f of rootFiles) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    for (const [oldColor, newColor] of Object.entries(mappings)) {
      const regex = new RegExp(oldColor.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, newColor);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(f, content, 'utf8');
      console.log(`Updated ${f}`);
    }
  }
}
