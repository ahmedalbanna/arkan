/**
 * Create Admin User Script
 * Creates an admin user for testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔐 Creating admin user...\n');

  const email = 'admin@arkan.dev';
  const password = 'admin123'; // Change in production!
  const name = 'Admin User';

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`⚠️  Admin user already exists: ${email}`);
      
      // Update to ensure admin role and add password if missing
      const passwordHash = await bcrypt.hash(password, 10);
      
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          passwordHash,
          emailVerified: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          credits: true,
        },
      });

      console.log('✅ Admin user updated:');
      console.log(`   Email: ${updated.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${updated.role}`);
      console.log(`   Credits: ${updated.credits}`);
      
      return updated;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        fullName: 'System Administrator',
        passwordHash,
        role: 'ADMIN',
        credits: 100000,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Credits: ${admin.credits}`);
    console.log('\n⚠️  IMPORTANT: Change the password in production!');

    return admin;
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
createAdminUser()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
