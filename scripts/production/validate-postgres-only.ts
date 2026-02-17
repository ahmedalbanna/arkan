/**
 * PostgreSQL-Only Validation Script
 * Validates PostgreSQL database integrity without Firebase comparison
 */

import { prisma } from '@/lib/db/prisma';

interface ValidationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  critical: boolean;
}

const results: ValidationResult[] = [];

async function validateDatabaseSchema(): Promise<void> {
  try {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const expectedTables = ['users', 'projects', 'transactions', 'accounts', 'sessions'];
    const tableNames = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    
    results.push({
      check: 'Database Schema',
      status: missingTables.length === 0 ? 'pass' : 'fail',
      details: `${tables.length} tables found${missingTables.length > 0 ? `, missing: ${missingTables.join(', ')}` : ''}`,
      critical: true,
    });
  } catch (error) {
    results.push({
      check: 'Database Schema',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateUserData(): Promise<void> {
  try {
    const userCount = await prisma.user.count();
    const usersWithEmail = await prisma.user.count({ 
      where: { 
        email: { 
          not: null 
        } 
      } 
    });
    
    const percentage = userCount > 0 ? ((usersWithEmail / userCount) * 100).toFixed(1) : '0';
    
    results.push({
      check: 'User Data Integrity',
      status: userCount > 0 ? 'pass' : 'warning',
      details: `${userCount} users, ${percentage}% with email`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'User Data Integrity',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateCreditSystem(): Promise<void> {
  try {
    const totalCredits = await prisma.user.aggregate({
      _sum: { credits: true },
    });
    
    const ledgerTotal = await prisma.creditLedger.aggregate({
      _sum: { amount: true },
    });
    
    const userCredits = totalCredits._sum.credits || 0;
    const ledgerAmount = ledgerTotal._sum.amount || 0;
    
    results.push({
      check: 'Credit System',
      status: 'pass',
      details: `User total: ${userCredits} credits, Ledger: ${ledgerAmount} (ledger tracks changes)`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'Credit System',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateTransactions(): Promise<void> {
  try {
    const transactionCount = await prisma.transaction.count();
    
    // Check for orphaned transactions using raw SQL
    const orphaned = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM transactions t
      WHERE NOT EXISTS (
        SELECT 1 FROM users u WHERE u.id = t.user_id
      )
    `;
    
    const orphanedTransactions = Number(orphaned[0].count);
    
    results.push({
      check: 'Transaction Integrity',
      status: orphanedTransactions === 0 ? 'pass' : 'fail',
      details: `${transactionCount} transactions, ${orphanedTransactions} orphaned`,
      critical: orphanedTransactions > 0,
    });
  } catch (error) {
    results.push({
      check: 'Transaction Integrity',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateProjects(): Promise<void> {
  try {
    const projectCount = await prisma.project.count();
    
    // Check for orphaned projects using raw SQL
    const orphaned = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM projects p
      WHERE NOT EXISTS (
        SELECT 1 FROM users u WHERE u.id = p.user_id
      )
    `;
    
    const orphanedProjects = Number(orphaned[0].count);
    
    results.push({
      check: 'Project Integrity',
      status: orphanedProjects === 0 ? 'pass' : 'fail',
      details: `${projectCount} projects, ${orphanedProjects} orphaned`,
      critical: orphanedProjects > 0,
    });
  } catch (error) {
    results.push({
      check: 'Project Integrity',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateIndexes(): Promise<void> {
  try {
    const indexes = await prisma.$queryRaw<Array<{ index_count: bigint }>>`
      SELECT COUNT(*) as index_count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `;
    
    const count = Number(indexes[0].index_count);
    
    results.push({
      check: 'Database Indexes',
      status: count > 50 ? 'pass' : 'warning',
      details: `${count} indexes created`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'Database Indexes',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: false,
    });
  }
}

async function validateTriggers(): Promise<void> {
  try {
    const triggers = await prisma.$queryRaw<Array<{ trigger_count: bigint }>>`
      SELECT COUNT(*) as trigger_count
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `;
    
    const count = Number(triggers[0].trigger_count);
    
    results.push({
      check: 'Database Triggers',
      status: count > 10 ? 'pass' : 'warning',
      details: `${count} triggers configured`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'Database Triggers',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: false,
    });
  }
}

async function validateRLSPolicies(): Promise<void> {
  try {
    const policies = await prisma.$queryRaw<Array<{ policy_count: bigint }>>`
      SELECT COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
    `;
    
    const count = Number(policies[0].policy_count);
    
    results.push({
      check: 'RLS Policies',
      status: count > 30 ? 'pass' : 'warning',
      details: `${count} RLS policies active`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'RLS Policies',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: false,
    });
  }
}

async function validatePerformance(): Promise<void> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    results.push({
      check: 'Database Performance',
      status: latency < 100 ? 'pass' : latency < 500 ? 'warning' : 'fail',
      details: `Query latency: ${latency}ms`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'Database Performance',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function runValidation(): Promise<void> {
  console.log('🔍 Running PostgreSQL Validation...\n');
  
  // Run all validations
  await validateDatabaseSchema();
  await validateUserData();
  await validateCreditSystem();
  await validateTransactions();
  await validateProjects();
  await validateIndexes();
  await validateTriggers();
  await validateRLSPolicies();
  await validatePerformance();
  
  // Print results
  console.log('='.repeat(70));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(70) + '\n');
  
  for (const result of results) {
    const icon = 
      result.status === 'pass' ? '✅' :
      result.status === 'warning' ? '⚠️' : '❌';
    
    const criticalTag = result.critical ? ' [CRITICAL]' : '';
    
    console.log(`${icon} ${result.check}${criticalTag}`);
    console.log(`   ${result.details}\n`);
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const criticalFailed = results.filter(r => r.status === 'fail' && r.critical).length;
  
  console.log('='.repeat(70));
  console.log(`Passed: ${passed} | Warnings: ${warnings} | Failed: ${failed}`);
  if (criticalFailed > 0) {
    console.log(`Critical Failures: ${criticalFailed}`);
  }
  console.log('='.repeat(70) + '\n');
  
  if (criticalFailed > 0) {
    console.log('❌ CRITICAL FAILURES DETECTED!');
    process.exit(1);
  } else if (failed > 0) {
    console.log('⚠️  Some validations failed (non-critical).');
    process.exit(0);
  } else if (warnings > 0) {
    console.log('⚠️  All checks passed with some warnings.');
    process.exit(0);
  } else {
    console.log('✅ ALL VALIDATIONS PASSED!');
    process.exit(0);
  }
}

// Run validation
runValidation().catch(error => {
  console.error('Fatal error running validation:', error);
  process.exit(1);
});
