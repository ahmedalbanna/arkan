/**
 * Migrate Transactions from Firebase to PostgreSQL
 * CRITICAL: Financial data - requires careful validation
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface FirebaseTransaction {
  id: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  credits: number;
  paymentMethod?: string;
  paymentRef?: string;
  receiptImage?: string;
  verifiedBy?: string;
  verifiedAt?: any;
  rejectionReason?: string;
  metadata?: any;
  createdAt: any;
  updatedAt: any;
}

async function migrateTransactions() {
  console.log('💰 Migrating Transactions from Firebase to PostgreSQL...\n');
  console.log('⚠️  CRITICAL: This involves financial data - proceed with caution!\n');

  try {
    // Load exported transactions
    const exportFile = path.join(process.cwd(), 'migration-exports', 'firestore', 'transactions.json');
    
    let transactions: FirebaseTransaction[] = [];
    try {
      const fileContent = await fs.readFile(exportFile, 'utf-8');
      transactions = JSON.parse(fileContent);
    } catch (error) {
      console.log('ℹ️  No transactions to migrate (file not found)');
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    console.log(`📂 Loaded ${transactions.length} transactions from export\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: any[] = [];
    let totalAmount = 0;
    let totalCredits = 0;

    for (const fbTxn of transactions) {
      try {
        // Verify user exists
        const userExists = await prisma.user.findUnique({
          where: { id: fbTxn.userId },
        });

        if (!userExists) {
          console.log(`   ⚠️  User not found for transaction ${fbTxn.id}, skipping`);
          skipped++;
          continue;
        }

        // Check if transaction already exists
        const existing = await prisma.transaction.findUnique({
          where: { id: fbTxn.id },
        });

        if (existing) {
          console.log(`   ⏭️  Transaction already exists: ${fbTxn.id}`);
          skipped++;
          continue;
        }

        // Prepare transaction data
        const txnData = {
          id: fbTxn.id,
          userId: fbTxn.userId,
          type: fbTxn.type.toUpperCase() as any,
          status: fbTxn.status.toUpperCase() as any,
          amount: fbTxn.amount,
          credits: fbTxn.credits,
          paymentMethod: fbTxn.paymentMethod || null,
          paymentRef: fbTxn.paymentRef || null,
          receiptImage: fbTxn.receiptImage || null,
          verifiedBy: fbTxn.verifiedBy || null,
          verifiedAt: fbTxn.verifiedAt ? new Date(fbTxn.verifiedAt) : null,
          rejectionReason: fbTxn.rejectionReason || null,
          metadata: fbTxn.metadata || null,
          createdAt: fbTxn.createdAt ? new Date(fbTxn.createdAt) : new Date(),
          updatedAt: fbTxn.updatedAt ? new Date(fbTxn.updatedAt) : new Date(),
        };

        // Create transaction
        await prisma.transaction.create({ data: txnData });

        // Track totals
        if (txnData.status === 'VERIFIED' || txnData.status === 'COMPLETED') {
          totalAmount += txnData.amount;
          totalCredits += txnData.credits;
        }

        console.log(`   ✅ Migrated: ${fbTxn.id} ($${fbTxn.amount}, ${fbTxn.credits} credits)`);
        migrated++;

      } catch (error) {
        console.error(`   ❌ Failed to migrate transaction ${fbTxn.id}:`, (error as Error).message);
        errors++;
        errorDetails.push({
          transactionId: fbTxn.id,
          userId: fbTxn.userId,
          amount: fbTxn.amount,
          error: (error as Error).message,
        });
      }
    }

    // Summary
    console.log('\n📊 Transaction Migration Summary:');
    console.log(`   Total Transactions: ${transactions.length}`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total Amount: $${totalAmount.toFixed(2)}`);
    console.log(`   Total Credits: ${totalCredits}`);

    if (errors > 0) {
      const errorFile = path.join(process.cwd(), 'migration-exports', 'transaction-migration-errors.json');
      await fs.writeFile(errorFile, JSON.stringify(errorDetails, null, 2));
      console.log(`\n   ⚠️  Error details saved to: ${errorFile}`);
    }

    // Validate migration - CRITICAL
    console.log('\n🔍 Validating financial data...');
    const pgTxnCount = await prisma.transaction.count();
    const pgTotalAmount = await prisma.transaction.aggregate({
      where: { status: { in: ['VERIFIED', 'COMPLETED'] } },
      _sum: { amount: true, credits: true },
    });

    console.log(`   PostgreSQL transactions: ${pgTxnCount}`);
    console.log(`   PostgreSQL total amount: $${pgTotalAmount._sum.amount || 0}`);
    console.log(`   PostgreSQL total credits: ${pgTotalAmount._sum.credits || 0}`);

    // CRITICAL: Check if amounts match
    const amountMatch = Math.abs((pgTotalAmount._sum.amount || 0) - totalAmount) < 0.01;
    const creditsMatch = (pgTotalAmount._sum.credits || 0) === totalCredits;

    if (!amountMatch || !creditsMatch) {
      console.error('\n❌ CRITICAL: Financial data mismatch detected!');
      console.error(`   Amount match: ${amountMatch}`);
      console.error(`   Credits match: ${creditsMatch}`);
      console.error('\n   DO NOT PROCEED TO PRODUCTION WITHOUT INVESTIGATING!');
    } else {
      console.log('\n✅ Financial data validation passed!');
    }

    // Save migration report
    const report = {
      migratedAt: new Date().toISOString(),
      source: 'Firebase',
      destination: 'PostgreSQL',
      totalTransactions: transactions.length,
      migrated,
      skipped,
      errors,
      errorDetails: errors > 0 ? errorDetails : [],
      financialSummary: {
        migratedAmount: totalAmount,
        migratedCredits: totalCredits,
        postgresqlAmount: pgTotalAmount._sum.amount || 0,
        postgresqlCredits: pgTotalAmount._sum.credits || 0,
        amountMatch,
        creditsMatch,
      },
      validation: {
        postgresqlTransactions: pgTxnCount,
        totalAmount: pgTotalAmount._sum.amount || 0,
        totalCredits: pgTotalAmount._sum.credits || 0,
      },
    };

    const reportFile = path.join(process.cwd(), 'migration-exports', 'transaction-migration-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    console.log(`\n✅ Transaction migration completed!`);
    console.log(`   Report: ${reportFile}`);

    return report;

  } catch (error) {
    console.error('❌ Transaction migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateTransactions()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { migrateTransactions };
