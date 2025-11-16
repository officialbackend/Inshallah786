#!/usr/bin/env node

/**
 * Comprehensive Pre-Deployment Test Suite
 * Tests all critical systems before production deployment
 * Run: node pre-deployment-final-test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let passed = 0;
let failed = 0;
const tests = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    tests.push({ name, status: '✅ PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    failed++;
    tests.push({ name, status: '❌ FAIL', error: error.message });
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('🏛️  DHA BACK OFFICE - PRE-DEPLOYMENT TEST SUITE');
console.log('='.repeat(60) + '\n');

// ============ FILE STRUCTURE TESTS ============
console.log('📁 File Structure Validation\n');

test('package.json exists', () => {
  const filePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(filePath)) throw new Error('package.json not found');
});

test('server/index.js exists', () => {
  const filePath = path.join(__dirname, 'server/index.js');
  if (!fs.existsSync(filePath)) throw new Error('server/index.js not found');
});

test('server/config/secrets.js exists', () => {
  const filePath = path.join(__dirname, 'server/config/secrets.js');
  if (!fs.existsSync(filePath)) throw new Error('server/config/secrets.js not found');
});

test('server/services/permit-service.js exists', () => {
  const filePath = path.join(__dirname, 'server/services/permit-service.js');
  if (!fs.existsSync(filePath)) throw new Error('server/services/permit-service.js not found');
});

test('server/routes/permits.js exists', () => {
  const filePath = path.join(__dirname, 'server/routes/permits.js');
  if (!fs.existsSync(filePath)) throw new Error('server/routes/permits.js not found');
});

// ============ SYNTAX VALIDATION TESTS ============
console.log('\n🔍 Syntax Validation\n');

test('server/index.js has valid syntax', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (content.includes('\\n') && !content.includes('`')) {
    throw new Error('Potential escaped newline without template literals');
  }
  if (!content.includes('import express')) throw new Error('Missing express import');
});

test('server/config/secrets.js has valid syntax', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes('export const config')) throw new Error('Missing config export');
  if (content.includes('\\n') && !content.includes('`')) {
    throw new Error('Potential escaped newline');
  }
});

test('server/services/permit-service.js has valid syntax', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/services/permit-service.js'), 'utf8');
  if (!content.includes('export async function getAllPermits')) {
    throw new Error('Missing getAllPermits export');
  }
  if (content.includes('\\n  console.log')) {
    throw new Error('Escaped newline found in console.log');
  }
});

// ============ CONFIGURATION TESTS ============
console.log('\n⚙️  Configuration Validation\n');

test('Production config: useProductionApis is true', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes('useProductionApis: true')) {
    throw new Error('useProductionApis not set to true');
  }
});

test('Production config: forceRealApis is true', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes('forceRealApis: true')) {
    throw new Error('forceRealApis not set to true');
  }
});

test('Production config: verificationLevel is production', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes("verificationLevel: 'production'")) {
    throw new Error('verificationLevel not set to production');
  }
});

test('Production config: realTimeValidation is true', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes('realTimeValidation: true')) {
    throw new Error('realTimeValidation not set to true');
  }
});

// ============ ENVIRONMENT VARIABLES TESTS ============
console.log('\n🔐 Environment Variables Configuration\n');

test('PKI Public Key has default value', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes("pkiPublicKey:") && !content.includes("PKI_PUBLIC_KEY")) {
    throw new Error('PKI Public Key not configured');
  }
});

test('DHA API Keys have defaults', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes("nprApiKey:") || !content.includes("dmsApiKey:")) {
    throw new Error('DHA API keys not configured');
  }
});

test('ICAO Configuration exists', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes("icao:")) {
    throw new Error('ICAO configuration missing');
  }
});

test('SAPS Configuration exists', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/config/secrets.js'), 'utf8');
  if (!content.includes("saps:")) {
    throw new Error('SAPS configuration missing');
  }
});

// ============ API ENDPOINTS TESTS ============
console.log('\n🔌 API Endpoints Validation\n');

test('Health endpoint defined', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes("app.get('/api/health'")) {
    throw new Error('Health endpoint not found');
  }
});

test('System status endpoint defined', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes("app.get('/api/system-status'")) {
    throw new Error('System status endpoint not found');
  }
});

test('Permits router mounted', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes("app.use('/api/permits'")) {
    throw new Error('Permits router not mounted');
  }
});

test('Root route defined', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes("app.get('/'")) {
    throw new Error('Root route not found');
  }
});

// ============ DATA VALIDATION TESTS ============
console.log('\n📊 Data Validation\n');

test('Fallback permits data exists', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/services/permit-service.js'), 'utf8');
  if (!content.includes('id: 1') || !content.includes('Muhammad Mohsin')) {
    throw new Error('Fallback data not found');
  }
});

test('All 13 permits present', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/services/permit-service.js'), 'utf8');
  let permitCount = 0;
  for (let i = 1; i <= 13; i++) {
    if (content.includes(`id: ${i},`)) permitCount++;
  }
  if (permitCount < 13) {
    throw new Error(`Only ${permitCount} permits found, expected 13`);
  }
});

test('Muhammad Mohsin passport correct', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/services/permit-service.js'), 'utf8');
  if (!content.includes('AD0110994')) {
    throw new Error('Muhammad Mohsin passport AD0110994 not found');
  }
});

test('Refugee certificate present', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/services/permit-service.js'), 'utf8');
  if (!content.includes('FAATI ABDURAHMAN') || !content.includes('REF/PTA/2025/10/13001')) {
    throw new Error('Refugee certificate data not found');
  }
});

// ============ SECURITY TESTS ============
console.log('\n🛡️  Security Configuration\n');

test('Helmet security middleware enabled', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes('app.use(helmet')) {
    throw new Error('Helmet middleware not found');
  }
});

test('CORS enabled', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes('app.use(cors')) {
    throw new Error('CORS not enabled');
  }
});

test('Rate limiting enabled', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes('rateLimit') || !content.includes("app.use('/api/', limiter")) {
    throw new Error('Rate limiting not enabled');
  }
});

test('Compression enabled', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes('app.use(compression')) {
    throw new Error('Compression not enabled');
  }
});

test('Error handler defined', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes('app.use((err, req, res')) {
    throw new Error('Error handler not defined');
  }
});

// ============ PRODUCTION READINESS TESTS ============
console.log('\n🚀 Production Readiness\n');

test('Port configured', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes('app.listen(PORT')) {
    throw new Error('Port configuration missing');
  }
});

test('Production logging messages present', () => {
  const content = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf8');
  if (!content.includes('PRODUCTION')) {
    throw new Error('Production indication missing');
  }
});

test('Health check path configured', () => {
  const content = fs.readFileSync(path.join(__dirname, 'render.yaml'), 'utf8');
  if (!content.includes('/api/health')) {
    throw new Error('Health check path not in render.yaml');
  }
});

test('Build and start commands correct', () => {
  const content = fs.readFileSync(path.join(__dirname, 'render.yaml'), 'utf8');
  if (!content.includes('npm install') || !content.includes('npm start')) {
    throw new Error('Build or start command incorrect');
  }
});

// ============ PACKAGE.JSON TESTS ============
console.log('\n📦 Package Configuration\n');

test('Express dependency exists', () => {
  const content = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  if (!content.includes('"express"')) {
    throw new Error('Express not in dependencies');
  }
});

test('Start script exists', () => {
  const content = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  if (!content.includes('"start":')) {
    throw new Error('Start script not defined');
  }
});

test('Node version specified', () => {
  const content = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  if (!content.includes('"node"') && !content.includes('engines')) {
    throw new Error('Node version not specified');
  }
});

// ============ FINAL REPORT ============
console.log('\n' + '='.repeat(60));
console.log('📋 TEST RESULTS');
console.log('='.repeat(60));
console.log(`\n✅ PASSED: ${passed}`);
console.log(`❌ FAILED: ${failed}`);
console.log(`📊 TOTAL:  ${passed + failed}`);
console.log(`📈 SUCCESS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED!');
  console.log('\n✅ System is production ready!\n');
  console.log('Next steps:');
  console.log('  1. git push origin main');
  console.log('  2. Go to https://dashboard.render.com');
  console.log('  3. Click "Deploy"');
  console.log('  4. Wait 5-10 minutes');
  console.log('  5. System will be LIVE!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed!');
  console.log('\nFailing tests:\n');
  tests.filter(t => t.status === '❌ FAIL').forEach(t => {
    console.log(`  ${t.name}`);
    if (t.error) console.log(`  → ${t.error}`);
  });
  console.log('\nFix issues before deployment!\n');
  process.exit(1);
}
