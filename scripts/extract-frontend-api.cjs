const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src');
const apiCalls = new Map(); // endpoint -> list of files

// Regex to find endpoints starting with /api/
const apiRegex = /['"`](\/api\/[^'"`]+)['"`]/g;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = apiRegex.exec(content)) !== null) {
    const endpoint = match[1];
    if (!apiCalls.has(endpoint)) {
      apiCalls.set(endpoint, []);
    }
    const relFile = path.relative('.', f).replace(/\\/g, '/');
    if (!apiCalls.get(endpoint).includes(relFile)) {
      apiCalls.get(endpoint).push(relFile);
    }
  }
});

console.log(`Total unique raw /api/ endpoints referenced in src: ${apiCalls.size}`);
const sorted = Array.from(apiCalls.keys()).sort();
sorted.forEach(ep => {
  console.log(`- ${ep} (${apiCalls.get(ep).length} refs, e.g. ${apiCalls.get(ep)[0]})`);
});
