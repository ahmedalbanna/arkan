/**
 * Database Seeding Script for PostgreSQL Migration
 * Seeds initial data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Admin User
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@arkan.dev' },
    update: {},
    create: {
      email: 'admin@arkan.dev',
      name: 'Admin User',
      fullName: 'System Administrator',
      role: 'ADMIN',
      credits: 10000,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Seed Test User
  console.log('👤 Creating test user...');
  const testUser = await prisma.user.upsert({
    where: { email: 'test@arkan.dev' },
    update: {},
    create: {
      email: 'test@arkan.dev',
      name: 'Test User',
      fullName: 'Test User Account',
      role: 'USER',
      credits: 100,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // Seed Agent Categories
  console.log('📁 Creating agent categories...');
  const categories = [
    { name: 'Academic Writing', description: 'Tools for academic papers and research', icon: '📚', order: 1 },
    { name: 'Content Generation', description: 'Generate various types of content', icon: '✍️', order: 2 },
    { name: 'Analysis Tools', description: 'Analyze and check content quality', icon: '🔍', order: 3 },
    { name: 'Project Tools', description: 'Project and documentation generators', icon: '📁', order: 4 },
  ];

  for (const category of categories) {
    await prisma.agentCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} agent categories`);

  // Seed Features
  console.log('🎛️  Creating feature flags...');
  const features = [
    { key: 'rag_enabled', name: 'RAG System', description: 'Enable RAG-powered generation', isEnabled: true },
    { key: 'payment_enabled', name: 'Payment System', description: 'Enable payment processing', isEnabled: true },
    { key: 'notifications_enabled', name: 'Notifications', description: 'Enable push notifications', isEnabled: true },
  ];

  for (const feature of features) {
    await prisma.feature.upsert({
      where: { key: feature.key },
      update: feature,
      create: feature,
    });
  }
  console.log(`✅ Created ${features.length} feature flags`);

  // Seed Settings
  console.log('⚙️  Creating system settings...');
  const settings = [
    { key: 'credits_per_dollar', value: 10, type: 'number', description: 'Credits awarded per dollar spent', isPublic: true },
    { key: 'min_purchase_amount', value: 5, type: 'number', description: 'Minimum purchase amount in dollars', isPublic: true },
    { key: 'max_purchase_amount', value: 500, type: 'number', description: 'Maximum purchase amount in dollars', isPublic: true },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type, description: setting.description },
      create: { key: setting.key, value: setting.value, type: setting.type, description: setting.description, isPublic: setting.isPublic },
    });
  }
  console.log(`✅ Created ${settings.length} system settings`);

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
