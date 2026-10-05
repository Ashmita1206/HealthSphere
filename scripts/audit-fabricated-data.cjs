const fs = require('fs');
const path = require('path');

const keywords = [
  'dummy', 'fake', 'mock', 'sample', 'demo', 'placeholder', 
  'fallback', 'seed', 'hardcoded', 'default', 'TODO', 'FIXME'
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.json')) {
      results.push(fullPath);
    }
  });
  return results;
}

const serverFiles = walk('./server');
const findings = [];

serverFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relFile = path.relative('.', file).replace(/\\/g, '/');

  lines.forEach((line, idx) => {
    keywords.forEach(kw => {
      // Case-insensitive regex with word boundary or specific indicator
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(line)) {
        findings.push({
          file: relFile,
          line: idx + 1,
          keyword: kw.toUpperCase(),
          snippet: line.trim().substring(0, 120)
        });
      }
    });
  });
});

console.log(`Total occurrences in server/: ${findings.length}`);

// Group by keyword
const byKw = {};
keywords.forEach(k => { byKw[k.toUpperCase()] = 0; });
findings.forEach(f => { byKw[f.keyword] = (byKw[f.keyword] || 0) + 1; });

console.log('Occurrences by keyword:');
Object.entries(byKw).forEach(([k, count]) => {
  console.log(`  ${k.padEnd(12)}: ${count}`);
});

// Sample specific notable keywords like dummy, fake, mock, placeholder, TODO, FIXME
console.log('\n--- Notable Findings (DUMMY, FAKE, MOCK, PLACEHOLDER, TODO, FIXME) ---');
findings.filter(f => ['DUMMY', 'FAKE', 'MOCK', 'PLACEHOLDER', 'TODO', 'FIXME'].includes(f.keyword)).forEach(f => {
  console.log(`${f.keyword.padEnd(12)} ${f.file}:${f.line} -> ${f.snippet}`);
});
