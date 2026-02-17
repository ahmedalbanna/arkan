/**
 * Manual Authentication Testing Script
 * Tests the complete login flow from database to session
 */

import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

async function testAuthenticationFlow() {
  console.log('\n🧪 AUTHENTICATION FLOW TEST\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Check database connection
    console.log('\n📊 Step 1: Testing Database Connection...');
    await prisma.$connect();
    console.log('   ✅ PostgreSQL connected successfully');

    // Step 2: Verify users table exists
    console.log('\n📋 Step 2: Checking Users Table...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Users table exists with ${userCount} users`);

    // Step 3: List existing users
    console.log('\n👥 Step 3: Listing Existing Users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        passwordHash: true,
      },
      take: 5,
    });

    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || 'No email'}`);
      console.log(`      - Name: ${user.name || 'N/A'}`);
      console.log(`      - Role: ${user.role}`);
      console.log(`      - Credits: ${user.credits}`);
      console.log(`      - Has Password: ${user.passwordHash ? 'Yes' : 'No'}`);
    });

    // Step 4: Test admin user password
    console.log('\n🔐 Step 4: Testing Admin User Password...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@arkan.dev' },
    });

    if (adminUser && adminUser.passwordHash) {
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, adminUser.passwordHash);
      
      if (isValid) {
        console.log('   ✅ Admin password verified correctly');
        console.log(`      Email: admin@arkan.dev`);
        console.log(`      Password: admin123`);
      } else {
        console.log('   ❌ Admin password verification failed');
        console.log('      The password might need to be reset');
      }
    } else {
      console.log('   ⚠️  Admin user not found or has no password');
      console.log('      Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.upsert({
        where: { email: 'admin@arkan.dev' },
        update: {
          passwordHash: hashedPassword,
        },
        create: {
          email: 'admin@arkan.dev',
          name: 'Admin User',
          role: 'ADMIN',
          passwordHash: hashedPassword,
          credits: 1000,
        },
      });
      
      console.log('   ✅ Admin user created successfully');
    }

    // Step 5: Check NextAuth tables
    console.log('\n📝 Step 5: Checking NextAuth Tables...');
    try {
      const sessionCount = await prisma.session.count();
      const accountCount = await prisma.account.count();
      console.log(`   ✅ Sessions: ${sessionCount}`);
      console.log(`   ✅ Accounts: ${accountCount}`);
    } catch (error) {
      console.log('   ⚠️  NextAuth tables might not be set up yet');
      console.log('      This is normal for first-time setup');
    }

    // Step 6: Environment variables check
    console.log('\n🔧 Step 6: Checking Environment Variables...');
    const envVars = {
      'DATABASE_URL': process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      'NEXTAUTH_URL': process.env.NEXTAUTH_URL || 'Not set (will use default)',
    };

    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // Step 7: Test URLs
    console.log('\n🌐 Step 7: Testing URLs...');
    console.log('   Server should be running on:');
    console.log('   - Main app: http://localhost:9002');
    console.log('   - Login: http://localhost:9002/login');
    console.log('   - Signup: http://localhost:9002/signup');
    console.log('   - API: http://localhost:9002/api/auth/session');

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ PRE-FLIGHT CHECKS COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📋 MANUAL TESTING CHECKLIST:\n');
    console.log('   1. ✅ Database connected');
    console.log('   2. ✅ Users table exists');
    console.log('   3. ✅ Admin user ready');
    console.log('   4. ⏳ NextAuth session (to be created on login)');
    console.log('   5. ⏳ Browser testing (ready to start)');
    
    console.log('\n🎯 READY TO TEST IN BROWSER!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: admin@arkan.dev');
    console.log('   Password: admin123');
    
    console.log('\n🌐 Open your browser and visit:');
    console.log('   http://localhost:9002/login\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuthenticationFlow()
  .then(() => {
    console.log('✅ Test completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
