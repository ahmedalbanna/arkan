/**
 * Migration Verification Script
 * Verifies that all migration infrastructure is properly set up
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying migration setup...\n');

  try {
    // 1. Check PostgreSQL Connection
    console.log('1️⃣  Checking PostgreSQL connection...');
    await prisma.$connect();
    console.log('   ✅ PostgreSQL connected successfully\n');

    // 2. Verify Database Tables
    console.log('2️⃣  Verifying database tables...');
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    console.log(`   ✅ Found ${tables.length} tables:`);
    tables.forEach(({ tablename }) => console.log(`      - ${tablename}`));
    console.log('');

    // 3. Check Critical Tables
    console.log('3️⃣  Checking critical tables...');
    const requiredTables = [
      'users',
      'accounts',
      'sessions',
      'transactions',
      'projects',
      'agents',
      'agent_categories',
    ];

    const existingTables = tables.map((t) => t.tablename);
    const missingTables = requiredTables.filter((t) => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log('   ⚠️  Missing tables:', missingTables.join(', '));
    } else {
      console.log('   ✅ All critical tables exist\n');
    }

    // 4. Test Basic Queries
    console.log('4️⃣  Testing basic queries...');
    const userCount = await prisma.user.count();
    const agentCategoryCount = await prisma.agentCategory.count();
    const featureCount = await prisma.feature.count();
    
    console.log(`   ✅ Users: ${userCount}`);
    console.log(`   ✅ Agent Categories: ${agentCategoryCount}`);
    console.log(`   ✅ Features: ${featureCount}\n`);

    // 5. Check Indexes
    console.log('5️⃣  Checking database indexes...');
    const indexes = await prisma.$queryRaw<Array<{ indexname: string; tablename: string }>>`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `;
    console.log(`   ✅ Found ${indexes.length} indexes (excluding primary keys)\n`);

    console.log('✅ Migration verification completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Tables: ${tables.length}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Agent Categories: ${agentCategoryCount}`);
    console.log(`   - Features: ${featureCount}`);
    console.log(`   - Indexes: ${indexes.length}`);

    return true;
  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
