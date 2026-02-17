/**
 * Post-Cutover Validation Script
 * Validates production system after cutover
 */

import { prisma } from '@/lib/db/prisma';
import admin from 'firebase-admin';

interface ValidationResult {
  check: string;
  status: 'pass' | 'fail';
  details: string;
  critical: boolean;
}

const results: ValidationResult[] = [];

async function validateUserCount(): Promise<void> {
  try {
    const pgCount = await prisma.user.count();
    const fbUsers = await admin.auth().listUsers(1000);
    const fbCount = fbUsers.users.length;
    
    const pass = Math.abs(pgCount - fbCount) < 5; // Allow small variance
    
    results.push({
      check: 'User Count Validation',
      status: pass ? 'pass' : 'fail',
      details: `PostgreSQL: ${pgCount} users, Firebase: ${fbCount} users`,
      critical: true,
    });
  } catch (error) {
    results.push({
      check: 'User Count Validation',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateCreditTotals(): Promise<void> {
  try {
    const pgCredits = await prisma.user.aggregate({
      _sum: { credits: true },
    });
    
    const fbSnapshot = await admin.firestore().collection('users').get();
    let fbCredits = 0;
    fbSnapshot.forEach(doc => {
      fbCredits += doc.data().credits || 0;
    });
    
    const pgTotal = pgCredits._sum.credits || 0;
    const pass = Math.abs(pgTotal - fbCredits) < 100; // Allow small variance
    
    results.push({
      check: 'Total Credits Validation',
      status: pass ? 'pass' : 'fail',
      details: `PostgreSQL: ${pgTotal} credits, Firebase: ${fbCredits} credits`,
      critical: true,
    });
  } catch (error) {
    results.push({
      check: 'Total Credits Validation',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateTransactionCount(): Promise<void> {
  try {
    const pgCount = await prisma.transaction.count();
    const fbSnapshot = await admin.firestore().collection('transactions').get();
    const fbCount = fbSnapshot.size;
    
    const pass = pgCount === fbCount;
    
    results.push({
      check: 'Transaction Count Validation',
      status: pass ? 'pass' : 'fail',
      details: `PostgreSQL: ${pgCount} transactions, Firebase: ${fbCount} transactions`,
      critical: true,
    });
  } catch (error) {
    results.push({
      check: 'Transaction Count Validation',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateProjectCount(): Promise<void> {
  try {
    const pgCount = await prisma.project.count();
    const fbSnapshot = await admin.firestore().collection('projects').get();
    const fbCount = fbSnapshot.size;
    
    const pass = Math.abs(pgCount - fbCount) < 5;
    
    results.push({
      check: 'Project Count Validation',
      status: pass ? 'pass' : 'fail',
      details: `PostgreSQL: ${pgCount} projects, Firebase: ${fbCount} projects`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'Project Count Validation',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: false,
    });
  }
}

async function validateRecentActivity(): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    
    const recentUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: oneHourAgo },
      },
    });
    
    const recentProjects = await prisma.project.count({
      where: {
        updatedAt: { gte: oneHourAgo },
      },
    });
    
    results.push({
      check: 'Recent Activity Check',
      status: 'pass',
      details: `${recentUsers} logins, ${recentProjects} project updates in last hour`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'Recent Activity Check',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: false,
    });
  }
}

async function validateSampleUserData(): Promise<void> {
  try {
    // Get 10 random users
    const users = await prisma.user.findMany({
      take: 10,
      select: { id: true, email: true, credits: true },
    });
    
    let mismatches = 0;
    
    for (const user of users) {
      const fbDoc = await admin.firestore()
        .collection('users')
        .doc(user.id)
        .get();
      
      const fbData = fbDoc.data();
      
      if (fbData && Math.abs((fbData.credits || 0) - user.credits) > 1) {
        mismatches++;
        console.error(`Credit mismatch for ${user.email}: PG=${user.credits}, FB=${fbData.credits}`);
      }
    }
    
    results.push({
      check: 'Sample User Data Validation',
      status: mismatches === 0 ? 'pass' : 'fail',
      details: `${mismatches}/${users.length} users with data mismatches`,
      critical: true,
    });
  } catch (error) {
    results.push({
      check: 'Sample User Data Validation',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: true,
    });
  }
}

async function validateDatabasePerformance(): Promise<void> {
  try {
    const start = Date.now();
    
    await prisma.user.findMany({ take: 100 });
    const queryTime = Date.now() - start;
    
    const pass = queryTime < 500; // Should be under 500ms
    
    results.push({
      check: 'Database Performance',
      status: pass ? 'pass' : 'fail',
      details: `Query executed in ${queryTime}ms`,
      critical: false,
    });
  } catch (error) {
    results.push({
      check: 'Database Performance',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error',
      critical: false,
    });
  }
}

async function runValidation(): Promise<void> {
  console.log('🔍 Running Post-Cutover Validation...\n');
  
  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  
  // Run all validations
  await validateUserCount();
  await validateCreditTotals();
  await validateTransactionCount();
  await validateProjectCount();
  await validateSampleUserData();
  await validateRecentActivity();
  await validateDatabasePerformance();
  
  // Print results
  console.log('='.repeat(70));
  console.log('POST-CUTOVER VALIDATION RESULTS');
  console.log('='.repeat(70) + '\n');
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : '❌';
    const criticalTag = result.critical ? ' [CRITICAL]' : '';
    
    console.log(`${icon} ${result.check}${criticalTag}`);
    console.log(`   ${result.details}\n`);
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const criticalFailed = results.filter(r => r.status === 'fail' && r.critical).length;
  
  console.log('='.repeat(70));
  console.log(`Passed: ${passed} | Failed: ${failed} | Critical Failures: ${criticalFailed}`);
  console.log('='.repeat(70) + '\n');
  
  if (criticalFailed > 0) {
    console.log('❌ CRITICAL FAILURES DETECTED - CONSIDER ROLLBACK!');
    process.exit(1);
  } else if (failed > 0) {
    console.log('⚠️  Some validations failed - review and monitor closely.');
    process.exit(0);
  } else {
    console.log('✅ ALL VALIDATIONS PASSED - Cutover successful!');
    process.exit(0);
  }
}

// Run validation
runValidation().catch(error => {
  console.error('Fatal error during validation:', error);
  process.exit(1);
});
