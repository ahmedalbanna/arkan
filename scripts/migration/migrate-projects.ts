/**
 * Migrate Projects from Firebase to PostgreSQL
 * Migrates user projects with all content
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface FirebaseProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: string;
  language?: string;
  content?: any;
  metadata?: any;
  templateId?: string;
  status?: string;
  createdAt: any;
  updatedAt: any;
}

async function migrateProjects() {
  console.log('📁 Migrating Projects from Firebase to PostgreSQL...\n');

  try {
    // Load exported projects
    const exportFile = path.join(process.cwd(), 'migration-exports', 'firestore', 'projects.json');
    
    let projects: FirebaseProject[] = [];
    try {
      const fileContent = await fs.readFile(exportFile, 'utf-8');
      projects = JSON.parse(fileContent);
    } catch (error) {
      console.log('ℹ️  No projects to migrate (file not found)');
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    console.log(`📂 Loaded ${projects.length} projects from export\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    for (const fbProject of projects) {
      try {
        // Verify user exists
        const userExists = await prisma.user.findUnique({
          where: { id: fbProject.userId },
        });

        if (!userExists) {
          console.log(`   ⚠️  User not found for project ${fbProject.id}, skipping`);
          skipped++;
          continue;
        }

        // Check if project already exists
        const existing = await prisma.project.findUnique({
          where: { id: fbProject.id },
        });

        if (existing) {
          console.log(`   ⏭️  Project already exists: ${fbProject.title}`);
          skipped++;
          continue;
        }

        // Prepare project data
        const projectData = {
          id: fbProject.id,
          userId: fbProject.userId,
          title: fbProject.title,
          description: fbProject.description || null,
          type: fbProject.type || 'report',
          language: fbProject.language || 'ar',
          content: fbProject.content || null,
          metadata: fbProject.metadata || null,
          templateId: fbProject.templateId || null,
          status: fbProject.status || 'draft',
          createdAt: fbProject.createdAt ? new Date(fbProject.createdAt) : new Date(),
          updatedAt: fbProject.updatedAt ? new Date(fbProject.updatedAt) : new Date(),
        };

        // Create project
        await prisma.project.create({ data: projectData });

        console.log(`   ✅ Migrated: ${fbProject.title} (${fbProject.type})`);
        migrated++;

      } catch (error) {
        console.error(`   ❌ Failed to migrate project ${fbProject.title}:`, (error as Error).message);
        errors++;
        errorDetails.push({
          projectId: fbProject.id,
          title: fbProject.title,
          userId: fbProject.userId,
          error: (error as Error).message,
        });
      }
    }

    // Summary
    console.log('\n📊 Project Migration Summary:');
    console.log(`   Total Projects: ${projects.length}`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);

    if (errors > 0) {
      const errorFile = path.join(process.cwd(), 'migration-exports', 'project-migration-errors.json');
      await fs.writeFile(errorFile, JSON.stringify(errorDetails, null, 2));
      console.log(`\n   ⚠️  Error details saved to: ${errorFile}`);
    }

    // Validate migration
    console.log('\n🔍 Validating migration...');
    const pgProjectCount = await prisma.project.count();
    const projectsByType = await prisma.project.groupBy({
      by: ['type'],
      _count: true,
    });

    console.log(`   PostgreSQL projects: ${pgProjectCount}`);
    console.log(`   By type:`);
    projectsByType.forEach(({ type, _count }) => {
      console.log(`      - ${type}: ${_count}`);
    });

    // Save migration report
    const report = {
      migratedAt: new Date().toISOString(),
      source: 'Firebase',
      destination: 'PostgreSQL',
      totalProjects: projects.length,
      migrated,
      skipped,
      errors,
      errorDetails: errors > 0 ? errorDetails : [],
      validation: {
        postgresqlProjects: pgProjectCount,
        byType: projectsByType,
      },
    };

    const reportFile = path.join(process.cwd(), 'migration-exports', 'project-migration-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    console.log(`\n✅ Project migration completed!`);
    console.log(`   Report: ${reportFile}`);

    return report;

  } catch (error) {
    console.error('❌ Project migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateProjects()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { migrateProjects };
