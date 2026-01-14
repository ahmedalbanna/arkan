#!/usr/bin/env tsx
/**
 * Migration Rollback Tool
 * 
 * Safely rollback flow migrations by:
 * - Disabling dynamic flow configs
 * - Re-enabling static flows
 * - Preserving migration data for analysis
 * 
 * Usage:
 *   npm run rollback-migration
 *   tsx scripts/migration/rollback-migration.ts [flowName] [--hard]
 */

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase
try {
  initializeApp();
} catch (error) {
  // Already initialized
}

const db = getFirestore();

interface RollbackResult {
  flowName: string;
  success: boolean;
  action: 'soft-rollback' | 'hard-rollback' | 'restored';
  backupPath?: string;
  error?: string;
}

interface RollbackReport {
  timestamp: string;
  type: 'soft' | 'hard';
  totalFlows: number;
  successful: number;
  failed: number;
  results: RollbackResult[];
}

/**
 * Soft rollback - disable dynamic flow but keep config
 */
async function softRollback(flowName: string): Promise<RollbackResult> {
  console.log(`\n🔄 Soft rollback: ${flowName}`);
  
  try {
    // Find the flow config
    const configsRef = db.collection('flowConfigs');
    const snapshot = await configsRef.where('name', '==', flowName).get();
    
    if (snapshot.empty) {
      throw new Error(`Flow config not found: ${flowName}`);
    }
    
    const doc = snapshot.docs[0];
    const currentConfig = doc.data();
    
    // Create backup
    const backupPath = path.join(
      process.cwd(),
      'migration-backups',
      'rollbacks',
      `${flowName}_${Date.now()}.json`
    );
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(backupPath, JSON.stringify(currentConfig, null, 2));
    console.log(`  💾 Backup saved: ${backupPath}`);
    
    // Disable the flow
    await doc.ref.update({
      isActive: false,
      rollbackDate: new Date().toISOString(),
      rollbackReason: 'Manual rollback via script',
    });
    
    console.log(`  ✅ Flow disabled (config preserved)`);
    
    return {
      flowName,
      success: true,
      action: 'soft-rollback',
      backupPath,
    };
    
  } catch (error) {
    console.error(`  ❌ Failed:`, error);
    return {
      flowName,
      success: false,
      action: 'soft-rollback',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Hard rollback - delete dynamic flow config completely
 */
async function hardRollback(flowName: string): Promise<RollbackResult> {
  console.log(`\n🗑️  Hard rollback: ${flowName}`);
  
  try {
    // Find the flow config
    const configsRef = db.collection('flowConfigs');
    const snapshot = await configsRef.where('name', '==', flowName).get();
    
    if (snapshot.empty) {
      throw new Error(`Flow config not found: ${flowName}`);
    }
    
    const doc = snapshot.docs[0];
    const currentConfig = doc.data();
    
    // Create backup
    const backupPath = path.join(
      process.cwd(),
      'migration-backups',
      'hard-rollbacks',
      `${flowName}_${Date.now()}.json`
    );
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(backupPath, JSON.stringify(currentConfig, null, 2));
    console.log(`  💾 Backup saved: ${backupPath}`);
    
    // Delete the config
    await doc.ref.delete();
    
    console.log(`  ✅ Flow config deleted`);
    
    return {
      flowName,
      success: true,
      action: 'hard-rollback',
      backupPath,
    };
    
  } catch (error) {
    console.error(`  ❌ Failed:`, error);
    return {
      flowName,
      success: false,
      action: 'hard-rollback',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Restore a flow from backup
 */
async function restoreFromBackup(backupPath: string): Promise<RollbackResult> {
  console.log(`\n♻️  Restoring from backup: ${backupPath}`);
  
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    const flowName = backupData.name;
    
    // Check if flow already exists
    const configsRef = db.collection('flowConfigs');
    const snapshot = await configsRef.where('name', '==', flowName).get();
    
    if (!snapshot.empty) {
      console.log(`  ⚠️  Flow config already exists, updating...`);
      await snapshot.docs[0].ref.set({
        ...backupData,
        restoredAt: new Date().toISOString(),
        restoredFrom: backupPath,
      });
    } else {
      console.log(`  ✨ Creating new flow config...`);
      await configsRef.add({
        ...backupData,
        restoredAt: new Date().toISOString(),
        restoredFrom: backupPath,
      });
    }
    
    console.log(`  ✅ Flow restored successfully`);
    
    return {
      flowName,
      success: true,
      action: 'restored',
      backupPath,
    };
    
  } catch (error) {
    console.error(`  ❌ Failed:`, error);
    return {
      flowName: 'unknown',
      success: false,
      action: 'restored',
      backupPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * List all migrated flows
 */
async function listMigratedFlows(): Promise<string[]> {
  const configsRef = db.collection('flowConfigs');
  const snapshot = await configsRef.get();
  
  return snapshot.docs.map(doc => doc.data().name as string);
}

/**
 * Rollback all flows
 */
async function rollbackAll(type: 'soft' | 'hard'): Promise<RollbackReport> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 Rolling back ALL flows (${type} rollback)`);
  console.log('='.repeat(80));
  
  const flows = await listMigratedFlows();
  console.log(`\n📋 Found ${flows.length} migrated flows\n`);
  
  const report: RollbackReport = {
    timestamp: new Date().toISOString(),
    type,
    totalFlows: flows.length,
    successful: 0,
    failed: 0,
    results: [],
  };
  
  for (const flowName of flows) {
    const result = type === 'soft' 
      ? await softRollback(flowName)
      : await hardRollback(flowName);
    
    report.results.push(result);
    
    if (result.success) {
      report.successful++;
    } else {
      report.failed++;
    }
  }
  
  return report;
}

/**
 * Print rollback report
 */
function printReport(report: RollbackReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 ROLLBACK SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nType: ${report.type.toUpperCase()} rollback`);
  console.log(`Total flows: ${report.totalFlows}`);
  console.log(`✅ Successful: ${report.successful}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`📈 Success rate: ${((report.successful / report.totalFlows) * 100).toFixed(1)}%`);
  
  if (report.failed > 0) {
    console.log('\nFailed rollbacks:');
    report.results
      .filter(r => !r.success)
      .forEach(r => console.log(`  ❌ ${r.flowName}: ${r.error}`));
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Save report
  const reportPath = path.join(
    process.cwd(),
    'migration-reports',
    'rollbacks',
    `rollback-${Date.now()}.json`
  );
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved: ${reportPath}\n`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const flowName = args.find(arg => !arg.startsWith('--'));
  const isHard = args.includes('--hard');
  const restoreArg = args.find(arg => arg.startsWith('--restore='));
  const listOnly = args.includes('--list');

  console.log('🔄 Migration Rollback Tool\n');

  try {
    if (listOnly) {
      // Just list migrated flows
      const flows = await listMigratedFlows();
      console.log(`📋 Migrated flows (${flows.length}):\n`);
      flows.forEach(flow => console.log(`  • ${flow}`));
      console.log('');
      
    } else if (restoreArg) {
      // Restore from backup
      const backupPath = restoreArg.split('=')[1];
      const result = await restoreFromBackup(backupPath);
      
      if (result.success) {
        console.log('\n✅ Restore successful!');
      } else {
        console.log('\n❌ Restore failed!');
        process.exit(1);
      }
      
    } else if (flowName) {
      // Rollback specific flow
      const result = isHard 
        ? await hardRollback(flowName)
        : await softRollback(flowName);
      
      if (result.success) {
        console.log(`\n✅ ${flowName} rolled back successfully!`);
      } else {
        console.log(`\n❌ Rollback failed!`);
        process.exit(1);
      }
      
    } else {
      // Rollback all flows
      console.log('⚠️  WARNING: This will rollback ALL migrated flows!');
      console.log(`   Type: ${isHard ? 'HARD (delete configs)' : 'SOFT (disable configs)'}`);
      console.log('\n   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const report = await rollbackAll(isHard ? 'hard' : 'soft');
      printReport(report);
      
      if (report.failed > 0) {
        console.log('⚠️  Some rollbacks failed - check the report for details');
        process.exit(1);
      } else {
        console.log('✅ All flows rolled back successfully!');
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Rollback failed:', error);
    process.exit(1);
  }
}

main();
