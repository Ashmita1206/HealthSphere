const fs = require('fs');
const path = require('path');
module.paths.push(path.resolve(__dirname, '../server/node_modules'));
const mongoose = require('mongoose');

console.log('====================================================');
console.log('🔍 HealthSphere Backend Model Integrity Verification');
console.log('====================================================\n');

// 1. Verify every server/models/*.js file can be required
const modelsDir = path.resolve(__dirname, '../server/models');
const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
console.log(`Found ${modelFiles.length} model files in server/models\n`);

let requireErrors = [];
for (const file of modelFiles) {
  try {
    const fullPath = path.join(modelsDir, file);
    const mod = require(fullPath);
    // console.log(`✓ Loaded: ${file}`);
  } catch (err) {
    console.error(`❌ FAILED loading ${file}:`, err.message);
    requireErrors.push({ file, error: err.message });
  }
}

console.log(`Model require errors: ${requireErrors.length}`);
const registeredModelNames = Object.keys(mongoose.models);
console.log(`Total registered mongoose models: ${registeredModelNames.length}`);
console.log('Registered models:');
registeredModelNames.sort().forEach((name, i) => {
  console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${name}`);
});

// 2. Scan server/controllers, server/services, server/routes, etc. for all model imports
const scanDirs = [
  path.resolve(__dirname, '../server/controllers'),
  path.resolve(__dirname, '../server/services'),
  path.resolve(__dirname, '../server/routes')
];

function getAllJsFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results = results.concat(getAllJsFiles(full));
    } else if (ent.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

let allJsFiles = [];
for (const d of scanDirs) {
  allJsFiles = allJsFiles.concat(getAllJsFiles(d));
}

console.log(`\nScanning ${allJsFiles.length} server files for model imports...`);

let importIssues = [];

for (const file of allJsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Match require expressions with 'models'
  const lines = content.split('\n');
  lines.forEach((line, lineNum) => {
    if (line.includes('require(') && line.includes('models/')) {
      const match = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (match) {
        const importPath = match[1];
        const dir = path.dirname(file);
        let resolved = path.resolve(dir, importPath);
        if (!fs.existsSync(resolved) && fs.existsSync(resolved + '.js')) {
          resolved = resolved + '.js';
        }
        if (!fs.existsSync(resolved)) {
          importIssues.push({
            file: path.relative(path.resolve(__dirname, '..'), file),
            line: lineNum + 1,
            importPath,
            issue: 'File does not exist'
          });
        } else {
          // Check casing matches exact file on disk (Windows is case-insensitive, but case must match!)
          const actualFileName = fs.readdirSync(path.dirname(resolved)).find(f => f.toLowerCase() === path.basename(resolved).toLowerCase());
          if (actualFileName && actualFileName !== path.basename(resolved)) {
            importIssues.push({
              file: path.relative(path.resolve(__dirname, '..'), file),
              line: lineNum + 1,
              importPath,
              issue: `Casing mismatch: import uses ${path.basename(resolved)} but disk file is ${actualFileName}`
            });
          }

          // Also check destructuring
          const destructureMatch = line.match(/const\s+\{([^}]+)\}\s*=\s*require/);
          if (destructureMatch) {
            const importedSymbols = destructureMatch[1].split(',').map(s => s.trim().split(':')[0].trim()).filter(Boolean);
            try {
              const exported = require(resolved);
              for (const sym of importedSymbols) {
                if (exported[sym] === undefined) {
                  importIssues.push({
                    file: path.relative(path.resolve(__dirname, '..'), file),
                    line: lineNum + 1,
                    importPath,
                    issue: `Export '${sym}' not found in ${path.basename(resolved)}. Available exports: ${Object.keys(exported).join(', ')}`
                  });
                }
              }
            } catch (err) {
              importIssues.push({
                file: path.relative(path.resolve(__dirname, '..'), file),
                line: lineNum + 1,
                importPath,
                issue: `Require error: ${err.message}`
              });
            }
          }
        }
      }
    }
  });
}

console.log(`\nModel import issues found: ${importIssues.length}`);
if (importIssues.length > 0) {
  console.log(JSON.stringify(importIssues, null, 2));
} else {
  console.log('✅ All model imports, paths, casings, and destructuring validated perfectly!');
}
