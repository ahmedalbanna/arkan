/**
 * Export Firebase Users
 * Exports all users from Firebase Auth and Firestore
 */

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

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
  customClaims?: any;
  // Firestore data
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

async function exportFirebaseUsers() {
  console.log('🔥 Exporting Firebase Users...\n');

  const exportDir = path.join(process.cwd(), 'migration-exports');
  await fs.mkdir(exportDir, { recursive: true });

  try {
    const users: FirebaseUser[] = [];
    let pageToken: string | undefined;
    let totalUsers = 0;

    // Export from Firebase Auth
    console.log('1️⃣  Exporting from Firebase Auth...');
    
    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      
      for (const userRecord of result.users) {
        const user: FirebaseUser = {
          uid: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || null,
          emailVerified: userRecord.emailVerified,
          phoneNumber: userRecord.phoneNumber || null,
          photoURL: userRecord.photoURL || null,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime,
          },
          providerData: userRecord.providerData,
          customClaims: userRecord.customClaims || {},
        };

        // Fetch Firestore data
        try {
          const firestoreDoc = await admin
            .firestore()
            .collection('users')
            .doc(userRecord.uid)
            .get();

          if (firestoreDoc.exists) {
            user.firestoreData = firestoreDoc.data();
          }
        } catch (error) {
          console.warn(`   ⚠️  Could not fetch Firestore data for ${userRecord.email}`);
        }

        users.push(user);
        totalUsers++;
      }

      pageToken = result.pageToken;
      console.log(`   Exported ${totalUsers} users so far...`);
    } while (pageToken);

    console.log(`\n✅ Exported ${totalUsers} users from Firebase Auth\n`);

    // Save to file
    const exportFile = path.join(exportDir, 'firebase-users.json');
    await fs.writeFile(exportFile, JSON.stringify(users, null, 2));

    console.log(`💾 Saved to: ${exportFile}\n`);

    // Generate summary
    const summary = {
      totalUsers,
      withEmail: users.filter(u => u.email).length,
      emailVerified: users.filter(u => u.emailVerified).length,
      withPhone: users.filter(u => u.phoneNumber).length,
      withFirestoreData: users.filter(u => u.firestoreData).length,
      disabled: users.filter(u => u.disabled).length,
      roles: {} as Record<string, number>,
      exportedAt: new Date().toISOString(),
    };

    // Count roles
    users.forEach(u => {
      const role = u.firestoreData?.role || u.customClaims?.role || 'user';
      summary.roles[role] = (summary.roles[role] || 0) + 1;
    });

    console.log('📊 Summary:');
    console.log(`   Total Users: ${summary.totalUsers}`);
    console.log(`   With Email: ${summary.withEmail}`);
    console.log(`   Email Verified: ${summary.emailVerified}`);
    console.log(`   With Phone: ${summary.withPhone}`);
    console.log(`   With Firestore Data: ${summary.withFirestoreData}`);
    console.log(`   Disabled: ${summary.disabled}`);
    console.log(`   Roles:`, summary.roles);

    // Save summary
    const summaryFile = path.join(exportDir, 'export-summary.json');
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));

    console.log(`\n✅ Export completed successfully!`);
    console.log(`   Users file: ${exportFile}`);
    console.log(`   Summary file: ${summaryFile}`);

    return { users, summary };
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

// Run export
if (require.main === module) {
  exportFirebaseUsers()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { exportFirebaseUsers };
