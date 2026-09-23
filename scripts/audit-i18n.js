const fs = require('fs');
const path = require('path');

const vi = JSON.parse(fs.readFileSync('client/src/i18n/vi.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('client/src/i18n/en.json', 'utf8'));

// 1. Check all keys in vi and en
function getLeaves(obj, prefix = '') {
  let leaves = {};
  for (const k in obj) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(leaves, getLeaves(obj[k], full));
    } else {
      leaves[full] = obj[k];
    }
  }
  return leaves;
}

const viLeaves = getLeaves(vi);
const enLeaves = getLeaves(en);

console.log('--- 1. PARITY CHECK ---');
console.log(`vi.json has ${Object.keys(viLeaves).length} keys`);
console.log(`en.json has ${Object.keys(enLeaves).length} keys`);

const missingInEn = Object.keys(viLeaves).filter(k => !(k in enLeaves));
const missingInVi = Object.keys(enLeaves).filter(k => !(k in viLeaves));
console.log('Missing in en:', missingInEn);
console.log('Missing in vi:', missingInVi);

// Check if any value is identical between vi and en (excluding brand names, numbers, emails, addresses, phones)
const identical = [];
for (const k in viLeaves) {
  if (enLeaves[k] && viLeaves[k] === enLeaves[k]) {
    const val = String(viLeaves[k]).trim();
    // filter out numbers, icons, emails, phone, brand
    if (val.length > 5 && !val.includes('@') && !val.includes('(08)') && !val.includes('Morley') && !val.includes('http') && !val.startsWith('+61') && !val.includes('SP094') && !val.match(/^\d+$/)) {
      identical.push({ key: k, val });
    }
  }
}
console.log('\n--- 2. IDENTICAL VALUES IN VI AND EN (Possible untranslated keys) ---');
console.log(`Found ${identical.length} identical non-trivial values:`);
identical.forEach(item => console.log(`  ${item.key}: "${item.val}"`));

// 2. Scan component files for hardcoded JSX text or props
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.jsx')) {
      results.push(full);
    }
  });
  return results;
}

const compFiles = walk('client/src/components');

console.log('\n--- 3. CHECKING COMPONENTS FOR UNTRANSLATED STRINGS ---');

const suspicious = [];

compFiles.forEach(file => {
  const relFile = file.split(path.sep).join('/');
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    // Check for hardcoded Vietnamese text without condition
    const viRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;
    if (viRegex.test(trimmed)) {
      // Check if it's conditioned by language or t(
      const hasLangCheck = trimmed.includes('language') || trimmed.includes("t('") || trimmed.includes('t("') || trimmed.includes('_vi') || trimmed.includes('labelVi') || trimmed.includes('qVi') || trimmed.includes('aVi') || trimmed.includes('captionVi') || trimmed.includes('vi:');
      if (!hasLangCheck) {
        suspicious.push({ file: relFile, line: idx + 1, reason: 'Unconditional Vietnamese text', text: trimmed });
      }
    }

    // Check for static hardcoded aria-label or title or placeholder with English or Vietnamese text
    const attrMatch = trimmed.match(/(aria-label|title|placeholder)="([^"{}\n]{4,})"/);
    if (attrMatch) {
      const attr = attrMatch[1];
      const val = attrMatch[2];
      // ignore pure icons or technical IDs
      if (!val.startsWith('http') && !val.includes('tel:') && !val.match(/^[\d\s\-_#]+$/)) {
        suspicious.push({ file: relFile, line: idx + 1, reason: `Static attribute ${attr}="${val}"`, text: trimmed });
      }
    }
  });
});

console.log(`Found ${suspicious.length} suspicious lines in components:`);
suspicious.forEach(s => {
  console.log(`[${s.reason}] ${s.file}:${s.line}\n    ${s.text}`);
});
