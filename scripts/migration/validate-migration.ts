/**
 * Validate Data Migration
 * Comprehensive validation of migrated data
 */

import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed - using export files only');
  }
}

interface ValidationResult {
  category: string;
  passed: boolean;
  details: any;
  issues?: string[];
}

async function validateMigration() {
  console.log('🔍 Validating Data Migration...\n');

  const results: ValidationResult[] = [];

  try {
    // ============================================================================
    // 1. Validate User Migration
    // ============================================================================
    console.log('1️⃣  Validating Users...\n');

    const pgUserCount = await prisma.user.count();
    const pgUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        credits: true,
        role: true,
      },
    });

    const totalPgCredits = pgUsers.reduce((sum, u) => sum + u.credits, 0);

    console.log(`   PostgreSQL Users: ${pgUserCount}`);
    console.log(`   Total Credits: ${totalPgCredits}`);

    // Load Firebase export
    let fbUserCount = 0;
    let totalFbCredits = 0;
    try {
      const exportFile = path.join(process.cwd(), 'migration-exports', 'firebase-users.json');
      const fileContent = await fs.readFile(exportFile, 'utf-8');
      const fbUsers = JSON.parse(fileContent);
      fbUserCount = fbUsers.filter((u: any) => !u.disabled && u.email).length;
      totalFbCredits = fbUsers.reduce((sum: number, u: any) => 
        sum + (u.firestoreData?.credits || 0), 0
      );
    } catch (error) {
      console.warn('   ⚠️  Could not load Firebase export');
    }

    const userIssues: string[] = [];
    const userCountMatch = pgUserCount >= fbUserCount * 0.95; // Allow 5% variance
    const creditsMatch = Math.abs(totalPgCredits - totalFbCredits) < 100; // Allow small variance

    if (!userCountMatch) {
      userIssues.push(`User count mismatch: PG ${pgUserCount} vs FB ${fbUserCount}`);
    }
    if (!creditsMatch) {
      userIssues.push(`Credits mismatch: PG ${totalPgCredits} vs FB ${totalFbCredits}`);
    }

    results.push({
      category: 'Users',
      passed: userIssues.length === 0,
      details: {
        postgresqlUsers: pgUserCount,
        firebaseUsers: fbUserCount,
        postgresqlCredits: totalPgCredits,
        firebaseCredits: totalFbCredits,
        match: userCountMatch && creditsMatch,
      },
      issues: userIssues.length > 0 ? userIssues : undefined,
    });

    console.log(`   ${userIssues.length === 0 ? '✅' : '❌'} User validation ${userIssues.length === 0 ? 'passed' : 'failed'}`);
    if (userIssues.length > 0) {
      userIssues.forEach(issue => console.log(`      - ${issue}`));
    }

    // ============================================================================
    // 2. Validate Transaction Migration (CRITICAL)
    // ============================================================================
    console.log('\n2️⃣  Validating Transactions (CRITICAL)...\n');

    const pgTxnCount = await prisma.transaction.count();
    const pgTxnStats = await prisma.transaction.aggregate({
      where: { status: { in: ['VERIFIED', 'COMPLETED'] } },
      _sum: { amount: true, credits: true },
      _count: true,
    });

    console.log(`   PostgreSQL Transactions: ${pgTxnCount}`);
    console.log(`   Verified Amount: $${pgTxnStats._sum.amount || 0}`);
    console.log(`   Verified Credits: ${pgTxnStats._sum.credits || 0}`);

    // Load Firebase export
    let fbTxnCount = 0;
    let fbTotalAmount = 0;
    let fbTotalCredits = 0;
    try {
      const exportFile = path.join(process.cwd(), 'migration-exports', 'firestore', 'transactions.json');
      const fileContent = await fs.readFile(exportFile, 'utf-8');
      const fbTxns = JSON.parse(fileContent);
      fbTxnCount = fbTxns.length;
      fbTxns.forEach((txn: any) => {
        if (txn.status === 'VERIFIED' || txn.status === 'COMPLETED') {
          fbTotalAmount += txn.amount || 0;
          fbTotalCredits += txn.credits || 0;
        }
      });
    } catch (error) {
      console.warn('   ⚠️  Could not load Firebase transactions export');
    }

    const txnIssues: string[] = [];
    const txnCountMatch = pgTxnCount >= fbTxnCount * 0.95;
    const amountMatch = Math.abs((pgTxnStats._sum.amount || 0) - fbTotalAmount) < 1;
    const txnCreditsMatch = (pgTxnStats._sum.credits || 0) === fbTotalCredits;

    if (!txnCountMatch) {
      txnIssues.push(`Transaction count mismatch: PG ${pgTxnCount} vs FB ${fbTxnCount}`);
    }
    if (!amountMatch) {
      txnIssues.push(`Amount mismatch: PG $${pgTxnStats._sum.amount} vs FB $${fbTotalAmount}`);
    }
    if (!txnCreditsMatch) {
      txnIssues.push(`Credits mismatch: PG ${pgTxnStats._sum.credits} vs FB ${fbTotalCredits}`);
    }

    results.push({
      category: 'Transactions',
      passed: txnIssues.length === 0,
      details: {
        postgresqlTransactions: pgTxnCount,
        firebaseTransactions: fbTxnCount,
        postgresqlAmount: pgTxnStats._sum.amount || 0,
        firebaseAmount: fbTotalAmount,
        postgresqlCredits: pgTxnStats._sum.credits || 0,
        firebaseCredits: fbTotalCredits,
        match: txnCountMatch && amountMatch && txnCreditsMatch,
      },
      issues: txnIssues.length > 0 ? txnIssues : undefined,
    });

    console.log(`   ${txnIssues.length === 0 ? '✅' : '❌'} Transaction validation ${txnIssues.length === 0 ? 'passed' : 'FAILED'}`);
    if (txnIssues.length > 0) {
      txnIssues.forEach(issue => console.log(`      - ${issue}`));
      console.log('\n   🚨 CRITICAL: Transaction mismatch detected!');
      console.log('      DO NOT PROCEED TO PRODUCTION WITHOUT INVESTIGATION!');
    }

    // ============================================================================
    // 3. Validate Project Migration
    // ============================================================================
    console.log('\n3️⃣  Validating Projects...\n');

    const pgProjectCount = await prisma.project.count();
    console.log(`   PostgreSQL Projects: ${pgProjectCount}`);

    let fbProjectCount = 0;
    try {
      const exportFile = path.join(process.cwd(), 'migration-exports', 'firestore', 'projects.json');
      const fileContent = await fs.readFile(exportFile, 'utf-8');
      const fbProjects = JSON.parse(fileContent);
      fbProjectCount = fbProjects.length;
    } catch (error) {
      console.warn('   ⚠️  Could not load Firebase projects export');
    }

    const projectIssues: string[] = [];
    const projectCountMatch = pgProjectCount >= fbProjectCount * 0.95;

    if (!projectCountMatch) {
      projectIssues.push(`Project count mismatch: PG ${pgProjectCount} vs FB ${fbProjectCount}`);
    }

    results.push({
      category: 'Projects',
      passed: projectIssues.length === 0,
      details: {
        postgresqlProjects: pgProjectCount,
        firebaseProjects: fbProjectCount,
        match: projectCountMatch,
      },
      issues: projectIssues.length > 0 ? projectIssues : undefined,
    });

    console.log(`   ${projectIssues.length === 0 ? '✅' : '❌'} Project validation ${projectIssues.length === 0 ? 'passed' : 'failed'}`);

    // ============================================================================
    // 4. Data Integrity Checks
    // ============================================================================
    console.log('\n4️⃣  Data Integrity Checks...\n');

    const integrityIssues: string[] = [];

    // Check for orphaned projects (user doesn't exist)
    const orphanedProjects = await prisma.project.count({
      where: {
        user: null,
      },
    });

    if (orphanedProjects > 0) {
      integrityIssues.push(`${orphanedProjects} orphaned projects (missing user)`);
    }

    // Check for orphaned transactions
    const orphanedTxns = await prisma.transaction.count({
      where: {
        user: null,
      },
    });

    if (orphanedTxns > 0) {
      integrityIssues.push(`${orphanedTxns} orphaned transactions (missing user)`);
    }

    // Check credit balance consistency
    const usersWithProjects = await prisma.user.findMany({
      include: {
        _count: {
          select: { projects: true, transactions: true },
        },
      },
    });

    let creditsInconsistency = 0;
    for (const user of usersWithProjects) {
      const ledgerBalance = await prisma.creditLedger.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
      });

      // Check if ledger exists and matches user credits (with tolerance)
      const ledgerSum = ledgerBalance._sum.amount || 0;
      if (ledgerSum > 0 && Math.abs(user.credits - ledgerSum) > 10) {
        creditsInconsistency++;
      }
    }

    if (creditsInconsistency > 0) {
      integrityIssues.push(`${creditsInconsistency} users with credit/ledger mismatch`);
    }

    results.push({
      category: 'Data Integrity',
      passed: integrityIssues.length === 0,
      details: {
        orphanedProjects,
        orphanedTransactions: orphanedTxns,
        creditInconsistencies: creditsInconsistency,
      },
      issues: integrityIssues.length > 0 ? integrityIssues : undefined,
    });

    console.log(`   ${integrityIssues.length === 0 ? '✅' : '❌'} Integrity checks ${integrityIssues.length === 0 ? 'passed' : 'failed'}`);
    if (integrityIssues.length > 0) {
      integrityIssues.forEach(issue => console.log(`      - ${issue}`));
    }

    // ============================================================================
    // Final Summary
    // ============================================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    const allPassed = results.every(r => r.passed);
    const criticalFailed = results.find(r => r.category === 'Transactions' && !r.passed);

    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.category}: ${result.passed ? 'PASSED' : 'FAILED'}`);
      if (result.issues) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    });

    console.log('\n' + '='.repeat(60));

    if (criticalFailed) {
      console.log('\n🚨 CRITICAL FAILURE: Transaction validation failed!');
      console.log('   Financial data mismatch detected.');
      console.log('   DO NOT PROCEED TO PRODUCTION!');
      console.log('   Investigation required.\n');
    } else if (!allPassed) {
      console.log('\n⚠️  Some validations failed.');
      console.log('   Review issues before proceeding to production.\n');
    } else {
      console.log('\n✅ All validations passed!');
      console.log('   Migration appears successful.\n');
    }

    // Save validation report
    const report = {
      validatedAt: new Date().toISOString(),
      allPassed,
      criticalFailed: !!criticalFailed,
      results,
    };

    const reportFile = path.join(process.cwd(), 'migration-exports', 'validation-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    console.log(`📄 Validation report saved: ${reportFile}\n`);

    return report;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
if (require.main === module) {
  validateMigration()
    .then(() => {
      console.log('✅ Validation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export { validateMigration };
