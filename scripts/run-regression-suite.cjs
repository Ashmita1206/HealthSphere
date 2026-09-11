#!/usr/bin/env node

/**
 * HealthSphere AI — Production Regression Test Runner
 */
const { execSync } = require('child_process');

console.log('====================================================');
console.log('🚀 Running HealthSphere Production Regression Suite');
console.log('====================================================\n');

const testSuites = [
  'src/test/apiSecurityLayer.test.ts',
  'src/test/authUpgrade.test.ts',
  'src/test/performanceOptimization.test.ts',
  'src/test/realtimeInfrastructure.test.ts',
  'src/test/loggingMonitoring.test.ts',
  'src/test/dockerDevops.test.ts',
  'src/test/ciPipelines.test.ts',
  'src/test/productionTestSuite.test.ts',
];

let allPassed = true;

for (const suite of testSuites) {
  process.stdout.write(`Testing: ${suite} ... `);
  try {
    execSync(`npx vitest run ${suite} --no-file-parallelism`, { stdio: 'pipe' });
    console.log('✅ PASSED');
  } catch (err) {
    console.log('❌ FAILED');
    allPassed = false;
  }
}

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 All 8 Phase 3 Test Suites Passed Successfully!');
  process.exit(0);
} else {
  console.log('⚠️ Some test suites encountered failures.');
  process.exit(1);
}
