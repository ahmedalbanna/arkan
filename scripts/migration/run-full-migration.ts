/**
 * Run Full Migration
 * Orchestrates the complete migration process
 */

import { exportFirebaseUsers } from './export-firebase-users';
import { exportFirestoreData } from './export-firestore-data';
import { migrateUsers } from './migrate-users';
import { migrateTransactions } from './migrate-transactions';
import { migrateProjects } from './migrate-projects';
import { validateMigration } from './validate-migration';
import fs from 'fs/promises';
import path from 'path';

async function runFullMigration() {
  console.log('🚀 Starting Full Migration Process...\n');
  console.log('=' .repeat(60));
  console.log('FIREBASE → POSTGRESQL MIGRATION');
  console.log('=' .repeat(60) + '\n');

  const startTime = Date.now();
  const migrationLog: any[] = [];

  try {
    // ============================================================================
    // Phase 1: Export from Firebase
    // ============================================================================
    console.log('📤 PHASE 1: Export from Firebase\n');
    
    let exportResults: any = {};
    
    try {
      console.log('Step 1.1: Exporting Firebase Auth users...');
      const userExport = await exportFirebaseUsers();
      exportResults.users = userExport;
      migrationLog.push({ step: 'Export Users', status: 'success', timestamp: new Date().toISOString() });
      console.log('✅ User export completed\n');
    } catch (error) {
      console.error('❌ User export failed:', (error as Error).message);
      migrationLog.push({ step: 'Export Users', status: 'failed', error: (error as Error).message });
      throw error;
    }

    try {
      console.log('Step 1.2: Exporting Firestore collections...');
      const firestoreExport = await exportFirestoreData();
      exportResults.firestore = firestoreExport;
      migrationLog.push({ step: 'Export Firestore', status: 'success', timestamp: new Date().toISOString() });
      console.log('✅ Firestore export completed\n');
    } catch (error) {
      console.error('❌ Firestore export failed:', (error as Error).message);
      migrationLog.push({ step: 'Export Firestore', status: 'failed', error: (error as Error).message });
      throw error;
    }

    console.log('=' .repeat(60) + '\n');

    // ============================================================================
    // Phase 2: Import to PostgreSQL
    // ============================================================================
    console.log('📥 PHASE 2: Import to PostgreSQL\n');

    let importResults: any = {};

    try {
      console.log('Step 2.1: Migrating users...');
      const userMigration = await migrateUsers();
      importResults.users = userMigration;
      migrationLog.push({ step: 'Migrate Users', status: 'success', timestamp: new Date().toISOString() });
      console.log('✅ User migration completed\n');
    } catch (error) {
      console.error('❌ User migration failed:', (error as Error).message);
      migrationLog.push({ step: 'Migrate Users', status: 'failed', error: (error as Error).message });
      throw error;
    }

    try {
      console.log('Step 2.2: Migrating transactions (CRITICAL - Financial Data)...');
      const txnMigration = await migrateTransactions();
      importResults.transactions = txnMigration;
      migrationLog.push({ step: 'Migrate Transactions', status: 'success', timestamp: new Date().toISOString() });
      console.log('✅ Transaction migration completed\n');
    } catch (error) {
      console.error('❌ Transaction migration failed:', (error as Error).message);
      migrationLog.push({ step: 'Migrate Transactions', status: 'failed', error: (error as Error).message });
      // Don't throw - continue to projects
    }

    try {
      console.log('Step 2.3: Migrating projects...');
      const projectMigration = await migrateProjects();
      importResults.projects = projectMigration;
      migrationLog.push({ step: 'Migrate Projects', status: 'success', timestamp: new Date().toISOString() });
      console.log('✅ Project migration completed\n');
    } catch (error) {
      console.error('❌ Project migration failed:', (error as Error).message);
      migrationLog.push({ step: 'Migrate Projects', status: 'failed', error: (error as Error).message });
      // Don't throw - continue to validation
    }

    console.log('=' .repeat(60) + '\n');

    // ============================================================================
    // Phase 3: Validation
    // ============================================================================
    console.log('🔍 PHASE 3: Validation\n');

    let validationResults: any = {};

    try {
      console.log('Step 3.1: Validating migrated data...');
      const validation = await validateMigration();
      validationResults = validation;
      migrationLog.push({ step: 'Validation', status: 'success', timestamp: new Date().toISOString() });
      console.log('✅ Validation completed\n');
    } catch (error) {
      console.error('❌ Validation failed:', (error as Error).message);
      migrationLog.push({ step: 'Validation', status: 'failed', error: (error as Error).message });
    }

    console.log('=' .repeat(60) + '\n');

    // ============================================================================
    // Final Summary
    // ============================================================================
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('📊 MIGRATION COMPLETE\n');
    console.log(`Duration: ${duration} minutes\n`);

    console.log('Export Summary:');
    console.log(`   Users: ${exportResults.users?.summary?.totalUsers || 0}`);
    console.log(`   Firestore Collections: ${exportResults.firestore?.summary?.totalDocuments || 0} documents\n`);

    console.log('Import Summary:');
    console.log(`   Users: ${importResults.users?.migrated || 0} migrated, ${importResults.users?.errors || 0} errors`);
    console.log(`   Transactions: ${importResults.transactions?.migrated || 0} migrated, ${importResults.transactions?.errors || 0} errors`);
    console.log(`   Projects: ${importResults.projects?.migrated || 0} migrated, ${importResults.projects?.errors || 0} errors\n`);

    console.log('Validation:');
    console.log(`   All Passed: ${validationResults.allPassed ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   Critical Failed: ${validationResults.criticalFailed ? 'YES 🚨' : 'NO ✅'}\n`);

    if (validationResults.criticalFailed) {
      console.log('🚨 CRITICAL: Financial data validation failed!');
      console.log('   DO NOT PROCEED TO PRODUCTION!');
      console.log('   Review validation-report.json for details.\n');
    } else if (!validationResults.allPassed) {
      console.log('⚠️  Some validations failed - review before production.\n');
    } else {
      console.log('✅ Migration completed successfully!\n');
    }

    // Save complete migration report
    const fullReport = {
      migratedAt: new Date().toISOString(),
      duration: `${duration} minutes`,
      log: migrationLog,
      export: exportResults,
      import: importResults,
      validation: validationResults,
    };

    const reportFile = path.join(process.cwd(), 'migration-exports', 'full-migration-report.json');
    await fs.writeFile(reportFile, JSON.stringify(fullReport, null, 2));

    console.log(`📄 Full migration report: ${reportFile}\n`);
    console.log('=' .repeat(60) + '\n');

    return fullReport;

  } catch (error) {
    console.error('\n❌ Migration process failed:', error);
    
    // Save error report
    const errorReport = {
      failedAt: new Date().toISOString(),
      error: (error as Error).message,
      log: migrationLog,
    };

    const errorFile = path.join(process.cwd(), 'migration-exports', 'migration-error.json');
    await fs.writeFile(errorFile, JSON.stringify(errorReport, null, 2));

    throw error;
  }
}

// Run migration
if (require.main === module) {
  runFullMigration()
    .then(() => {
      console.log('✅ Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    });
}

export { runFullMigration };
