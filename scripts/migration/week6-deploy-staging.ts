#!/usr/bin/env tsx

/**
 * Week 6 Staging Deployment Script
 * Deploy migrated flows to staging environment
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../../docudec-firebase-adminsdk-2maa7-d07a19d3fc.json');

// Check if app is already initialized
try {
  getFirestore();
} catch (error) {
  // App not initialized, so initialize it
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

interface DeploymentConfig {
  environment: 'staging' | 'production';
  flows: string[];
  timestamp: string;
  deployedBy: string;
}

const PHASE1_FLOWS = [
  'generate-text', 'paraphrase-text', 'summarize-text', 'translate-text',
  'humanize-text', 'manipulate-text', 'text-stylist', 'topic-explainer',
  'generate-citation', 'generate-ideas', 'rewrite-to-markdown', 'text-to-speech',
  'image-to-text', 'generate-ui-description', 'generate-plantuml'
];

const PHASE2_FLOWS = [
  'grammar-checker', 'bias-checker', 'fact-checker', 'plagiarism-checker',
  'detect-ai-content', 'sentence-structure-checker', 'academic-paper-quality-checker',
  'ai-proofread-document', 'fact-retrieval', 'question-answering'
];

/**
 * Validate flow configuration before deployment
 */
async function validateFlowConfig(flowId: string): Promise<boolean> {
  try {
    const flowDoc = await db.collection('flows').doc(flowId).get();
    
    if (!flowDoc.exists) {
      console.error(`  ✗ Flow ${flowId} not found in database`);
      return false;
    }
    
    const flowData = flowDoc.data();
    
    // Check required fields
    const requiredFields = ['name', 'steps', 'inputSchema', 'outputSchema', 'isActive'];
    for (const field of requiredFields) {
      if (!(field in flowData!)) {
        console.error(`  ✗ Flow ${flowId} missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate steps
    if (!Array.isArray(flowData!.steps) || flowData!.steps.length === 0) {
      console.error(`  ✗ Flow ${flowId} has no valid steps`);
      return false;
    }
    
    console.log(`  ✓ Flow ${flowId} validation passed`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error validating ${flowId}:`, error);
    return false;
  }
}

/**
 * Deploy flow to staging
 */
async function deployFlow(flowId: string): Promise<boolean> {
  try {
    // Get flow configuration
    const flowDoc = await db.collection('flows').doc(flowId).get();
    const flowData = flowDoc.data();
    
    // Create staging version
    const stagingData = {
      ...flowData,
      environment: 'staging',
      deployedAt: new Date().toISOString(),
      deployedBy: 'week6-migration',
      version: (flowData?.version || 0) + 1
    };
    
    // Save to staging collection
    await db.collection('flows-staging').doc(flowId).set(stagingData);
    
    // Update deployment log
    await db.collection('deployment-logs').add({
      flowId,
      environment: 'staging',
      version: stagingData.version,
      timestamp: new Date().toISOString(),
      status: 'deployed'
    });
    
    console.log(`  ✓ Deployed ${flowId} to staging (v${stagingData.version})`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to deploy ${flowId}:`, error);
    return false;
  }
}

/**
 * Run health check on deployed flows
 */
async function healthCheck(flowIds: string[]): Promise<{healthy: number, unhealthy: number}> {
  console.log('\n Running health checks...');
  
  let healthy = 0;
  let unhealthy = 0;
  
  for (const flowId of flowIds) {
    try {
      const flowDoc = await db.collection('flows-staging').doc(flowId).get();
      
      if (flowDoc.exists && flowDoc.data()?.isActive) {
        healthy++;
        console.log(`  ✓ ${flowId}: Healthy`);
      } else {
        unhealthy++;
        console.log(`  ✗ ${flowId}: Unhealthy`);
      }
    } catch (error) {
      unhealthy++;
      console.log(`  ✗ ${flowId}: Error`);
    }
  }
  
  return { healthy, unhealthy };
}

/**
 * Create rollback snapshot
 */
async function createRollbackSnapshot(flows: string[]) {
  console.log('\n Creating rollback snapshot...');
  
  const snapshot = {
    timestamp: new Date().toISOString(),
    environment: 'staging',
    flows: {} as Record<string, any>
  };
  
  for (const flowId of flows) {
    try {
      const flowDoc = await db.collection('flows-staging').doc(flowId).get();
      if (flowDoc.exists) {
        snapshot.flows[flowId] = flowDoc.data();
      }
    } catch (error) {
      console.error(`  ✗ Error snapshotting ${flowId}`);
    }
  }
  
  // Save snapshot
  const snapshotDoc = await db.collection('deployment-snapshots').add(snapshot);
  console.log(`  ✓ Snapshot created: ${snapshotDoc.id}`);
  
  return snapshotDoc.id;
}

/**
 * Main deployment function
 */
async function deployToStaging() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Week 6 Staging Deployment                           ║');
  console.log('║   Deploying Phase 1 & 2 Flows                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const allFlows = [...PHASE1_FLOWS, ...PHASE2_FLOWS];
  const startTime = Date.now();
  
  const results = {
    validated: [] as string[],
    deployed: [] as string[],
    failed: [] as string[]
  };
  
  try {
    // Step 1: Create rollback snapshot
    const snapshotId = await createRollbackSnapshot(allFlows);
    
    // Step 2: Validate all flows
    console.log('\n═══ Phase 1: Validation ═══\n');
    for (const flowId of allFlows) {
      const isValid = await validateFlowConfig(flowId);
      if (isValid) {
        results.validated.push(flowId);
      } else {
        results.failed.push(flowId);
      }
    }
    
    console.log(`\nValidation complete: ${results.validated.length}/${allFlows.length} passed\n`);
    
    if (results.failed.length > 0) {
      console.log('⚠ Warning: Some flows failed validation. Continue? (y/n)');
      console.log('Failed flows:', results.failed.join(', '));
    }
    
    // Step 3: Deploy validated flows
    console.log('\n═══ Phase 2: Deployment ═══\n');
    for (const flowId of results.validated) {
      const deployed = await deployFlow(flowId);
      if (deployed) {
        results.deployed.push(flowId);
      } else {
        results.failed.push(flowId);
      }
    }
    
    // Step 4: Health check
    console.log('\n═══ Phase 3: Health Check ═══');
    const healthStatus = await healthCheck(results.deployed);
    
    // Generate report
    const duration = Date.now() - startTime;
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   Deployment Summary                                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Total Flows: ${allFlows.length}`);
    console.log(`✓ Deployed: ${results.deployed.length}`);
    console.log(`✗ Failed: ${results.failed.length}`);
    console.log(`\nHealth Status:`);
    console.log(`  ✓ Healthy: ${healthStatus.healthy}`);
    console.log(`  ✗ Unhealthy: ${healthStatus.unhealthy}`);
    console.log(`\nDeployment Time: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Rollback Snapshot: ${snapshotId}`);
    
    // Save deployment report
    const report = {
      week: 6,
      environment: 'staging',
      timestamp: new Date().toISOString(),
      duration,
      snapshotId,
      flows: {
        total: allFlows.length,
        validated: results.validated,
        deployed: results.deployed,
        failed: results.failed
      },
      health: healthStatus,
      phase1: {
        total: PHASE1_FLOWS.length,
        deployed: results.deployed.filter(f => PHASE1_FLOWS.includes(f)).length
      },
      phase2: {
        total: PHASE2_FLOWS.length,
        deployed: results.deployed.filter(f => PHASE2_FLOWS.includes(f)).length
      }
    };
    
    await db.collection('deployment-reports').add(report);
    
    const reportPath = path.join(process.cwd(), 'migration-output', 'week6-deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✓ Deployment report saved to: ${reportPath}`);
    
    if (results.failed.length === 0 && healthStatus.unhealthy === 0) {
      console.log('\n✓ Deployment Successful! All flows are healthy.\n');
    } else {
      console.log('\n⚠ Deployment completed with issues. Review failed flows.\n');
    }
    
  } catch (error) {
    console.error('\n✗ Deployment failed:', error);
    console.log('\nTo rollback, run: npm run rollback-staging');
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deployToStaging()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Deployment error:', error);
      process.exit(1);
    });
}

export { deployToStaging, validateFlowConfig, deployFlow, healthCheck };
