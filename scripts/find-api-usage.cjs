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
const apiUsage = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relFile = path.relative('.', f).replace(/\\/g, '/');

  // Match api.get, api.post, api.put, api.patch, api.delete
  const apiMethodRegex = /api\.(get|post|put|patch|delete)\s*(?:<[^>]+>)?\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let m;
  while ((m = apiMethodRegex.exec(content)) !== null) {
    apiUsage.push({
      file: relFile,
      method: m[1].toUpperCase(),
      path: m[2].startsWith('/api') ? m[2] : '/api' + (m[2].startsWith('/') ? m[2] : '/' + m[2]),
      rawPath: m[2]
    });
  }

  // Also match fetch('/api/...')
  const fetchRegex = /fetch\s*\(\s*[`'"](\/api\/[^`'"]+)[`'"]/g;
  while ((m = fetchRegex.exec(content)) !== null) {
    apiUsage.push({
      file: relFile,
      method: 'FETCH',
      path: m[1],
      rawPath: m[1]
    });
  }
});

// Group by path and method
const grouped = new Map();
apiUsage.forEach(item => {
  const key = `${item.method} ${item.path}`;
  if (!grouped.has(key)) {
    grouped.set(key, { method: item.method, path: item.path, files: new Set() });
  }
  grouped.get(key).files.add(item.file);
});

console.log(`Found ${grouped.size} unique frontend API calls:`);
Array.from(grouped.values()).sort((a,b) => a.path.localeCompare(b.path)).forEach(item => {
  console.log(`${item.method.padEnd(6)} ${item.path.padEnd(40)} (used in: ${Array.from(item.files).slice(0, 2).join(', ')})`);
});
