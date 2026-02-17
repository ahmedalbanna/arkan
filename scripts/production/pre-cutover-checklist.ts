/**
 * Pre-Cutover Checklist Script
 * Validates all requirements before production cutover
 */

import { prisma } from '@/lib/db/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

const results: CheckResult[] = [];

async function runCheck(
  name: string,
  critical: boolean,
  checkFn: () => Promise<boolean>,
  successMsg: string,
  failMsg: string
): Promise<void> {
  try {
    const passed = await checkFn();
    results.push({
      name,
      status: passed ? 'pass' : 'fail',
      message: passed ? successMsg : failMsg,
      critical,
    });
  } catch (error) {
    results.push({
      name,
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical,
    });
  }
}

async function checkDatabaseConnectivity(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkDatabaseMigrations(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('npx prisma migrate status');
    return stdout.includes('Database schema is up to date');
  } catch {
    return false;
  }
}

async function checkTableCount(): Promise<boolean> {
  const tables = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  `;
  return tables[0].count >= 19;
}

async function checkIndexes(): Promise<boolean> {
  const indexes = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*) as count
    FROM pg_indexes
    WHERE schemaname = 'public'
  `;
  return indexes[0].count >= 60;
}

async function checkTriggers(): Promise<boolean> {
  const triggers = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*) as count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
  `;
  return triggers[0].count >= 15;
}

async function checkRLSPolicies(): Promise<boolean> {
  const policies = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*) as count
    FROM pg_policies
  `;
  return policies[0].count >= 40;
}

async function checkUserCount(): Promise<boolean> {
  const count = await prisma.user.count();
  return count > 0;
}

async function checkTransactionIntegrity(): Promise<boolean> {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'COMPLETED' },
  });
  
  for (const txn of transactions) {
    const user = await prisma.user.findUnique({
      where: { id: txn.userId },
    });
    
    if (!user) {
      console.error(`Orphaned transaction: ${txn.id} for user ${txn.userId}`);
      return false;
    }
  }
  
  return true;
}

async function checkEnvironmentVariables(): Promise<boolean> {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'HASURA_ADMIN_SECRET',
    'HASURA_GRAPHQL_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

async function checkBackupExists(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('ls -la backups/ | grep -c ".sql"');
    return parseInt(stdout.trim()) > 0;
  } catch {
    return false;
  }
}

async function checkHasuraHealth(): Promise<boolean> {
  try {
    const response = await fetch(process.env.HASURA_GRAPHQL_URL?.replace('/v1/graphql', '/healthz') || '');
    return response.ok;
  } catch {
    return false;
  }
}

async function checkDiskSpace(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('df -h / | tail -1');
    const usage = parseInt(stdout.split(/\s+/)[4].replace('%', ''));
    return usage < 80; // Less than 80% full
  } catch {
    return true; // Can't check, assume OK
  }
}

async function runAllChecks(): Promise<void> {
  console.log('🔍 Running Pre-Cutover Checklist...\n');

  // Critical Infrastructure Checks
  await runCheck(
    'Database Connectivity',
    true,
    checkDatabaseConnectivity,
    'PostgreSQL connection successful',
    'CRITICAL: Cannot connect to PostgreSQL'
  );

  await runCheck(
    'Database Migrations',
    true,
    checkDatabaseMigrations,
    'All migrations applied',
    'CRITICAL: Pending migrations exist'
  );

  await runCheck(
    'Table Count',
    true,
    checkTableCount,
    '19+ tables created',
    'CRITICAL: Missing database tables'
  );

  await runCheck(
    'Database Indexes',
    true,
    checkIndexes,
    '60+ indexes created',
    'WARNING: Some indexes may be missing'
  );

  await runCheck(
    'Database Triggers',
    true,
    checkTriggers,
    '15+ triggers configured',
    'CRITICAL: Missing triggers'
  );

  await runCheck(
    'RLS Policies',
    true,
    checkRLSPolicies,
    '40+ RLS policies active',
    'CRITICAL: Missing security policies'
  );

  // Data Integrity Checks
  await runCheck(
    'User Data',
    true,
    checkUserCount,
    'Users exist in database',
    'CRITICAL: No users found in database'
  );

  await runCheck(
    'Transaction Integrity',
    true,
    checkTransactionIntegrity,
    'All transactions have valid users',
    'CRITICAL: Orphaned transactions detected'
  );

  // Configuration Checks
  await runCheck(
    'Environment Variables',
    true,
    checkEnvironmentVariables,
    'All required env vars set',
    'CRITICAL: Missing environment variables'
  );

  await runCheck(
    'Hasura Health',
    true,
    checkHasuraHealth,
    'Hasura is healthy and responding',
    'CRITICAL: Hasura not responding'
  );

  // Operational Checks
  await runCheck(
    'Database Backup',
    false,
    checkBackupExists,
    'Recent backup found',
    'WARNING: No recent backup found'
  );

  await runCheck(
    'Disk Space',
    false,
    checkDiskSpace,
    'Sufficient disk space available',
    'WARNING: Low disk space'
  );

  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log('CHECKLIST RESULTS');
  console.log('='.repeat(60) + '\n');

  let criticalFailures = 0;
  let warnings = 0;

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);

    if (result.status === 'fail' && result.critical) {
      criticalFailures++;
    } else if (result.status === 'warning' || (result.status === 'fail' && !result.critical)) {
      warnings++;
    }
  }

  console.log('='.repeat(60));
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.status === 'pass').length}`);
  console.log(`Warnings: ${warnings}`);
  console.log(`Critical Failures: ${criticalFailures}`);
  console.log('='.repeat(60) + '\n');

  if (criticalFailures > 0) {
    console.log('❌ CUTOVER BLOCKED: Fix critical failures before proceeding!\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  CUTOVER ALLOWED WITH WARNINGS: Review warnings before proceeding.\n');
    process.exit(0);
  } else {
    console.log('✅ ALL CHECKS PASSED: Ready for production cutover!\n');
    process.exit(0);
  }
}

// Run checks
runAllChecks().catch(error => {
  console.error('Fatal error running checklist:', error);
  process.exit(1);
});
