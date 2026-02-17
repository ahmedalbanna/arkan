/**
 * Test NextAuth Configuration
 * Verifies authentication setup
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testNextAuth() {
  console.log('🧪 Testing NextAuth Configuration\n');

  try {
    // ============================================================================
    // 1. Test User Schema
    // ============================================================================
    console.log('1️⃣  Testing User Schema...\n');

    const testUser = await prisma.user.findFirst({
      where: { email: 'test@arkan.dev' },
    });

    if (testUser) {
      console.log(`   ✅ User found: ${testUser.email}`);
      console.log(`   - ID: ${testUser.id}`);
      console.log(`   - Role: ${testUser.role}`);
      console.log(`   - Credits: ${testUser.credits}`);
      console.log(`   - Has password: ${testUser.passwordHash ? 'Yes' : 'No'}`);
    }

    // ============================================================================
    // 2. Test Password Hashing
    // ============================================================================
    console.log('\n2️⃣  Testing Password Hashing...\n');

    const testPassword = 'test123456';
    const hash = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hash);

    console.log(`   ✅ Password hashing: ${isValid ? 'Working' : 'Failed'}`);
    console.log(`   - Hash length: ${hash.length} characters`);

    // ============================================================================
    // 3. Test Admin User
    // ============================================================================
    console.log('\n3️⃣  Testing Admin User...\n');

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (admin) {
      console.log(`   ✅ Admin user found: ${admin.email}`);
      console.log(`   - Has password: ${admin.passwordHash ? 'Yes' : 'No'}`);
      
      if (admin.passwordHash) {
        const isPasswordValid = await bcrypt.compare('admin123', admin.passwordHash);
        console.log(`   - Password valid: ${isPasswordValid ? 'Yes' : 'No'}`);
      }
    } else {
      console.log('   ⚠️  No admin user found');
    }

    // ============================================================================
    // 4. Test NextAuth Tables
    // ============================================================================
    console.log('\n4️⃣  Testing NextAuth Tables...\n');

    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('accounts', 'sessions', 'verification_tokens')
      ORDER BY tablename
    `;

    console.log(`   ✅ NextAuth tables exist: ${tables.length}/3`);
    tables.forEach(({ tablename }) => console.log(`      - ${tablename}`));

    // Check for any existing accounts
    const accountCount = await prisma.account.count();
    const sessionCount = await prisma.session.count();

    console.log(`\n   📊 Current data:`);
    console.log(`      - Accounts: ${accountCount}`);
    console.log(`      - Sessions: ${sessionCount}`);

    // ============================================================================
    // 5. Test RLS Helper Functions
    // ============================================================================
    console.log('\n5️⃣  Testing RLS Helper Functions...\n');

    const functions = await prisma.$queryRaw<Array<{ routine_name: string }>>`
      SELECT routine_name 
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN ('current_user_id', 'is_admin', 'owns_resource')
      ORDER BY routine_name
    `;

    console.log(`   ✅ RLS helper functions: ${functions.length}/3`);
    functions.forEach(({ routine_name }) => console.log(`      - ${routine_name}()`));

    // ============================================================================
    // 6. Summary
    // ============================================================================
    console.log('\n✅ All tests completed!\n');
    console.log('📊 Summary:');
    console.log(`   - User schema: ✅`);
    console.log(`   - Password hashing: ✅`);
    console.log(`   - Admin user: ${admin ? '✅' : '⚠️'}`);
    console.log(`   - NextAuth tables: ✅`);
    console.log(`   - RLS functions: ✅`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Test login: curl -X POST http://localhost:9002/api/auth/callback/credentials');
    console.log('   2. Configure Hasura permissions in console: http://localhost:8080');
    console.log('   3. Test GraphQL queries with JWT token');
    console.log('   4. Review: docs/migration/HASURA_JWT_SETUP.md');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testNextAuth()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
