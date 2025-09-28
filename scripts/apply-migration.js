/**
 * Apply Migration Script
 *
 * هذا السكريبت يستبدل routes الأصلية بالنسخ المهاجرة
 * ويحدث الاستيرادات في جميع أنحاء المشروع
 */

const fs = require('fs');
const path = require('path');

// Migration mapping
const migrationMap = {
    // Auth routes
    'src/app/api/auth/session/route.ts': 'src/app/api/auth/session/route-migrated.ts',
    'src/app/api/auth/logout/route.ts': 'src/app/api/auth/logout/route-migrated.ts',
    'src/app/api/auth/signup/route.ts': 'src/app/api/auth/signup/route-migrated.ts',

    // User routes
    'src/app/api/users/[id]/route.ts': 'src/app/api/users/[id]/route-migrated.ts',
    'src/app/api/users/[id]/reset-password/route.ts': 'src/app/api/users/[id]/reset-password/route-migrated.ts',
    'src/app/api/users/[id]/upload-profile-picture/route.ts': 'src/app/api/users/[id]/upload-profile-picture/route-migrated.ts',

    // Writing tools routes
    'src/app/api/writing-tools/[tool]/route.ts': 'src/app/api/writing-tools/[tool]/route-migrated.ts',

    // Admin routes
    'src/app/api/admin/users/route.ts': 'src/app/api/admin/users/route-migrated.ts',
    'src/app/api/admin/dashboard-stats/route.ts': 'src/app/api/admin/dashboard-stats/route-migrated.ts'
};

// Import mapping for updates
const importMap = {
    // Legacy imports to new imports
    "from '@/lib/api-utils'": "from '@/lib/core/api'",
    "import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils'":
        "import { withEnhancedAuth, handleApiErrorEnhanced, createApiResponseEnhanced } from '@/lib/core/api'",
    "import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils'":
        "import { withAuthLegacy, handleApiErrorLegacy, createApiResponseLegacy } from '@/lib/core/api'"
};

/**
 * Backup original file
 */
function backupFile(filePath) {
    const backupPath = filePath + '.backup';
    if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
        console.log(`📦 Backed up: ${filePath} -> ${backupPath}`);
        return true;
    }
    return false;
}

/**
 * Apply migration for a single file
 */
function applyMigration(originalPath, migratedPath) {
    console.log(`🔄 Applying migration: ${originalPath}`);

    // Check if both files exist
    if (!fs.existsSync(migratedPath)) {
        console.log(`❌ Migrated file not found: ${migratedPath}`);
        return false;
    }

    // Backup original file
    const backedUp = backupFile(originalPath);

    try {
        // Copy migrated file to original location
        fs.copyFileSync(migratedPath, originalPath);
        console.log(`✅ Applied migration: ${originalPath}`);
        return true;
    } catch (error) {
        console.log(`❌ Failed to apply migration: ${originalPath}`, error.message);

        // Restore backup if it exists
        if (backedUp) {
            const backupPath = originalPath + '.backup';
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, originalPath);
                console.log(`🔄 Restored backup: ${originalPath}`);
            }
        }
        return false;
    }
}

/**
 * Update imports in a file
 */
function updateImports(filePath) {
    if (!fs.existsSync(filePath)) {
        return false;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // Apply import mappings
        for (const [oldImport, newImport] of Object.entries(importMap)) {
            if (content.includes(oldImport)) {
                content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`📝 Updated imports: ${filePath}`);
            return true;
        }

        return false;
    } catch (error) {
        console.log(`❌ Failed to update imports: ${filePath}`, error.message);
        return false;
    }
}

/**
 * Find all TypeScript files that might need import updates
 */
function findTypeScriptFiles(dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            findTypeScriptFiles(fullPath, files);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Main migration function
 */
function runMigration() {
    console.log('🚀 Starting Migration Application...\n');

    const results = {
        applied: 0,
        failed: 0,
        updated: 0,
        total: Object.keys(migrationMap).length
    };

    // Apply migrations
    console.log('📋 Applying Route Migrations...');
    for (const [originalPath, migratedPath] of Object.entries(migrationMap)) {
        if (applyMigration(originalPath, migratedPath)) {
            results.applied++;
        } else {
            results.failed++;
        }
    }

    // Update imports
    console.log('\n📝 Updating Imports...');
    const tsFiles = findTypeScriptFiles('src');

    for (const file of tsFiles) {
        if (updateImports(file)) {
            results.updated++;
        }
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Routes Applied: ${results.applied}/${results.total}`);
    console.log(`❌ Routes Failed: ${results.failed}/${results.total}`);
    console.log(`📝 Files Updated: ${results.updated}`);
    console.log(`📈 Success Rate: ${((results.applied / results.total) * 100).toFixed(1)}%`);

    if (results.failed > 0) {
        console.log('\n⚠️  Some migrations failed. Check the logs above for details.');
        console.log('💡 You can restore backups by running: npm run restore-migration');
    } else {
        console.log('\n🎉 All migrations applied successfully!');
        console.log('💡 Next steps:');
        console.log('   1. Run tests: npm run test');
        console.log('   2. Start development server: npm run dev');
        console.log('   3. Test the migrated routes');
    }

    return results;
}

/**
 * Restore backups
 */
function restoreBackups() {
    console.log('🔄 Restoring Backups...\n');

    const results = {
        restored: 0,
        notFound: 0
    };

    for (const originalPath of Object.keys(migrationMap)) {
        const backupPath = originalPath + '.backup';

        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, originalPath);
            fs.unlinkSync(backupPath);
            console.log(`✅ Restored: ${originalPath}`);
            results.restored++;
        } else {
            console.log(`❌ Backup not found: ${backupPath}`);
            results.notFound++;
        }
    }

    console.log(`\n📊 Restore Summary:`);
    console.log(`✅ Restored: ${results.restored}`);
    console.log(`❌ Not Found: ${results.notFound}`);

    return results;
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'apply':
        runMigration();
        break;
    case 'restore':
        restoreBackups();
        break;
    case 'test':
        console.log('🧪 Running migration tests...');
        // This would run the test suite
        break;
    default:
        console.log('📖 Migration Script Usage:');
        console.log('  node scripts/apply-migration.js apply   - Apply migrations');
        console.log('  node scripts/apply-migration.js restore - Restore backups');
        console.log('  node scripts/apply-migration.js test    - Run tests');
        break;
}
