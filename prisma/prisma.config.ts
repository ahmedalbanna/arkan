/**
 * Prisma 7.x Configuration
 * Database connection configuration for Prisma Client and Migrations
 */

const config = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://arkan_user:arkan_dev_password@localhost:5432/arkan_dev',
    },
  },
};

export default config;
