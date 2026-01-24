#!/usr/bin/env node

/**
 * Security Verification Script
 * 
 * This script verifies that:
 * 1. No hardcoded credentials are present in the codebase
 * 2. All required environment variables are configured
 * 3. The application is secure for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SENSITIVE_PATTERNS = [
  { pattern: /AIzaSy[A-Za-z0-9_-]{35}/, name: 'Firebase API Key' },
  { pattern: /-----BEGIN PRIVATE KEY-----/, name: 'Private Key' },
  { pattern: /firebase-adminsdk/, name: 'Firebase Service Account' },
  { pattern: /185\.190\.140\.93/, name: 'Hardcoded IP Address' },
  { pattern: /http:\/\/[^/]+:11434/, name: 'Hardcoded Ollama Server' },
  { pattern: /http:\/\/[^/]+:9003/, name: 'Hardcoded Conversion API' },
];

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const EXCLUDED_PATHS = [
  'node_modules',
  '.next',
  '.git',
  '.genkit',
  'dist',
  'build',
  'coverage',
];

let issuesFound = 0;
let issuesFixed = 0;

console.log('🔒 Security Verification Script\n');
console.log('=' .repeat(50));

// Check 1: Scan for hardcoded secrets
console.log('\n✓ Check 1: Scanning for hardcoded secrets...\n');

try {
  const cmd = `find src -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \\) 2>/dev/null`;
  const files = execSync(cmd, { encoding: 'utf8' }).split('\n').filter(f => f);

  let foundSecrets = false;

  for (const pattern of SENSITIVE_PATTERNS) {
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (pattern.pattern.test(content)) {
          console.error(`❌ Found ${pattern.name} in ${file}`);
          foundSecrets = true;
          issuesFound++;
        }
      } catch (e) {
        // Skip unreadable files
      }
    }
  }

  if (!foundSecrets) {
    console.log('✅ No hardcoded secrets detected in source code');
  }
} catch (e) {
  console.error('⚠️  Could not scan for secrets:', e.message);
}

// Check 2: Verify .env.local exists
console.log('\n✓ Check 2: Verifying .env.local configuration...\n');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');

  // Check which environment variables are set
  const envContent = fs.readFileSync(envPath, 'utf8');
  const setVars = REQUIRED_ENV_VARS.filter(v => envContent.includes(`${v}=`));
  const missingVars = REQUIRED_ENV_VARS.filter(v => !envContent.includes(`${v}=`));

  console.log(`   ${setVars.length}/${REQUIRED_ENV_VARS.length} variables configured`);

  if (missingVars.length > 0) {
    console.log('\n⚠️  Missing environment variables:');
    missingVars.forEach(v => console.log(`   - ${v}`));
    issuesFound++;
  }
} else {
  console.log('⚠️  .env.local file not found');
  console.log('   Run: cp .env.example .env.local');
  issuesFound++;
}

// Check 3: Verify .gitignore excludes .env files
console.log('\n✓ Check 3: Verifying .gitignore configuration...\n');

const gitignorePath = path.join(process.cwd(), '.gitignore');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

const gitignoreChecks = [
  { pattern: '.env', found: gitignoreContent.includes('.env') },
  { pattern: '.env.local', found: gitignoreContent.includes('.env.local') },
  { pattern: 'firebase-adminsdk', found: gitignoreContent.includes('firebase-adminsdk') },
];

let allGitignoreGood = true;
for (const check of gitignoreChecks) {
  if (check.found) {
    console.log(`✅ .gitignore excludes ${check.pattern}`);
  } else {
    console.log(`❌ .gitignore does NOT exclude ${check.pattern}`);
    allGitignoreGood = false;
    issuesFound++;
  }
}

// Check 4: Verify config files use environment variables
console.log('\n✓ Check 4: Verifying config files use environment variables...\n');

const configFile = path.join(process.cwd(), 'src/lib/config.ts');
const configContent = fs.readFileSync(configFile, 'utf8');

if (configContent.includes('process.env.')) {
  console.log('✅ src/lib/config.ts uses process.env for configuration');
} else {
  console.log('❌ src/lib/config.ts does not use process.env');
  issuesFound++;
}

// Check 5: Verify service account file is not in repository
console.log('\n✓ Check 5: Verifying no service account files in repository...\n');

const serviceAccountFiles = [
  'docudec-firebase-adminsdk-2maa7-d07a19d3fc.json',
  'firebase-adminsdk-*.json',
];

let foundServiceAccountFile = false;
for (const pattern of serviceAccountFiles) {
  try {
    const globPattern = pattern.replace('*', '[a-zA-Z0-9-]*');
    const cmd = `find . -type f -name "${pattern}" 2>/dev/null | grep -v node_modules`;
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    
    if (result) {
      console.error(`❌ Found service account file: ${result}`);
      foundServiceAccountFile = true;
      issuesFound++;
    }
  } catch (e) {
    // Expected if no files found
  }
}

if (!foundServiceAccountFile) {
  console.log('✅ No service account files found in repository');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📋 Security Verification Summary\n');

if (issuesFound === 0) {
  console.log('🎉 All security checks passed!');
  console.log('\n✅ Ready for deployment');
  process.exit(0);
} else {
  console.log(`❌ ${issuesFound} security issue(s) found`);
  console.log('\n📖 Review the issues above and fix them before deploying.');
  console.log('📚 See docs/SECURITY_ENVIRONMENT_SETUP.md for details.\n');
  process.exit(1);
}
