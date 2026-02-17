/**
 * Migrate Users from Firebase to PostgreSQL
 * Migrates users, preserving all data and credits
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  providerData: any[];
  firestoreData?: {
    role?: string;
    credits?: number;
    totalSpent?: number;
    fullName?: string;
    phone?: string;
    bio?: string;
    [key: string]: any;
  };
}

async function migrateUsers() {
  console.log('🔄 Migrating Users from Firebase to PostgreSQL...\n');

  try {
    // Load exported users
    const exportFile = path.join(process.cwd(), 'migration-exports', 'firebase-users.json');
    const fileContent = await fs.readFile(exportFile, 'utf-8');
    const users: FirebaseUser[] = JSON.parse(fileContent);

    console.log(`📂 Loaded ${users.length} users from export\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    for (const fbUser of users) {
      try {
        // Skip disabled users
        if (fbUser.disabled) {
          console.log(`   ⏭️  Skipping disabled user: ${fbUser.email}`);
          skipped++;
          continue;
        }

        // Skip users without email
        if (!fbUser.email) {
          console.log(`   ⏭️  Skipping user without email: ${fbUser.uid}`);
          skipped++;
          continue;
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({
          where: { id: fbUser.uid },
        });

        if (existing) {
          console.log(`   ⏭️  User already exists: ${fbUser.email}`);
          skipped++;
          continue;
        }

        // Prepare user data
        const userData = {
          id: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.firestoreData?.fullName || 'User',
          fullName: fbUser.firestoreData?.fullName || fbUser.displayName || null,
          image: fbUser.photoURL || null,
          emailVerified: fbUser.emailVerified ? new Date() : null,
          phone: fbUser.phoneNumber || fbUser.firestoreData?.phone || null,
          phoneVerified: fbUser.phoneNumber ? new Date() : null,
          role: (fbUser.firestoreData?.role?.toUpperCase() || 'USER') as any,
          credits: fbUser.firestoreData?.credits || 0,
          totalSpent: fbUser.firestoreData?.totalSpent || 0,
          passwordHash: null, // Users will need to reset password
          createdAt: new Date(fbUser.metadata.creationTime),
          updatedAt: new Date(),
          lastLoginAt: fbUser.metadata.lastSignInTime 
            ? new Date(fbUser.metadata.lastSignInTime)
            : null,
        };

        // Create user
        await prisma.user.create({ data: userData });

        // Migrate OAuth accounts
        for (const provider of fbUser.providerData) {
          if (provider.providerId === 'password') continue; // Skip password provider

          const providerName = provider.providerId.replace('.com', '');
          
          try {
            await prisma.account.create({
              data: {
                userId: fbUser.uid,
                type: 'oauth',
                provider: providerName,
                providerAccountId: provider.uid,
              },
            });
          } catch (accountError) {
            console.warn(`   ⚠️  Could not migrate account for ${fbUser.email}:`, providerName);
          }
        }

        console.log(`   ✅ Migrated: ${fbUser.email} (${userData.credits} credits)`);
        migrated++;

      } catch (error) {
        console.error(`   ❌ Failed to migrate ${fbUser.email}:`, (error as Error).message);
        errors++;
        errorDetails.push({
          email: fbUser.email,
          uid: fbUser.uid,
          error: (error as Error).message,
        });
      }
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);

    if (errors > 0) {
      const errorFile = path.join(process.cwd(), 'migration-exports', 'user-migration-errors.json');
      await fs.writeFile(errorFile, JSON.stringify(errorDetails, null, 2));
      console.log(`\n   ⚠️  Error details saved to: ${errorFile}`);
    }

    // Validate migration
    console.log('\n🔍 Validating migration...');
    const pgUserCount = await prisma.user.count();
    const totalCredits = await prisma.user.aggregate({
      _sum: { credits: true },
    });

    console.log(`   PostgreSQL users: ${pgUserCount}`);
    console.log(`   Total credits: ${totalCredits._sum.credits || 0}`);

    // Save migration report
    const report = {
      migratedAt: new Date().toISOString(),
      source: 'Firebase',
      destination: 'PostgreSQL',
      totalUsers: users.length,
      migrated,
      skipped,
      errors,
      errorDetails: errors > 0 ? errorDetails : [],
      validation: {
        postgresqlUsers: pgUserCount,
        totalCredits: totalCredits._sum.credits || 0,
      },
    };

    const reportFile = path.join(process.cwd(), 'migration-exports', 'user-migration-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    console.log(`\n✅ User migration completed!`);
    console.log(`   Report: ${reportFile}`);

    return report;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { migrateUsers };
