
'use server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';
import type { Agent, AgentData } from '@/lib/agents';
import { AGENTS as defaultAgents } from '@/lib/agents';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  role: UserRole;
  createdAt: string; // Storing as ISO string
  updatedAt: string; // Storing as ISO string
  teams?: string[]; // Array of team IDs
  bio?: string;
  profilePictureUrl?: string;
  hasCompletedOnboarding?: boolean;
}

export interface Team {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
}

export interface TeamMember {
    userId: string;
    teamId: string;
    role: 'owner' | 'member';
    joinedAt: string;
    // Denormalized fields for efficiency
    name: string;
    email: string;
    profilePictureUrl?: string;
}

export interface TransactionData {
  id: string; // Firestore document ID
  userId: string;
  planId: string;
  planName: string;
  credits: number;
  price: number;
  userName: string;
  userEmail: string;
  status: 'pending' | 'verified' | 'rejected';
  proofUrl: string;
  createdAt: string;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

// === User Queries ===

export async function getUserProfile(id: string): Promise<UserProfile | null> {
    if (!id) return null;
    const userDoc = await adminDb.collection('users').doc(id).get();
    if (!userDoc.exists) {
        return null;
    }
    const data = userDoc.data();
    return { id: userDoc.id, ...data } as UserProfile;
}

export async function getPaginatedUsers({ limit, lastVisibleId }: { limit: number, lastVisibleId?: string }) {
    let query = adminDb.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit + 1); // Fetch one extra to check for hasNextPage

    if (lastVisibleId) {
      const lastDoc = await adminDb.collection('users').doc(lastVisibleId).get();
      if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
      }
    }
    
    const snapshot = await query.get();
    const users = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() })) as UserProfile[];
    const hasNextPage = snapshot.docs.length > limit;
    const newLastVisibleId = hasNextPage ? snapshot.docs[snapshot.docs.length - 2].id : null;
    
    return { users, hasNextPage, lastVisibleId: newLastVisibleId };
}

export async function createUser(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }): Promise<{ user: { uid: string, email?: string | undefined } }> {
    const adminAuth = await getAdminAuth();
    const { email, password, name, role, credits } = data;
    
    const userRecord = await adminAuth.createUser({ email, password, displayName: name });
    
    const newUserProfile: Omit<UserProfile, 'id'> = {
        name,
        email,
        credits: credits,
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: '',
        profilePictureUrl: '',
        hasCompletedOnboarding: false,
    };
    
    await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);
    
    return { user: { uid: userRecord.uid, email: userRecord.email } };
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const updatePayload = {
        ...data,
        updatedAt: new Date().toISOString(),
    };
    await adminDb.collection('users').doc(userId).update(updatePayload);
    const updatedUser = await getUserProfile(userId);
    if (!updatedUser) throw new Error("Failed to refetch updated user profile.");
    return updatedUser;
}

export async function deleteUser(userId: string) {
    const adminAuth = await getAdminAuth();
    await adminAuth.deleteUser(userId);
    await adminDb.collection('users').doc(userId).delete();
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
 const adminAuth = await getAdminAuth();
 await adminAuth.updateUser(userId, { password: newPassword });
}


// === Credit Queries ===

export async function updateUserCredits(userId: string, creditsToAdd: number): Promise<number> {
    const userRef = adminDb.collection('users').doc(userId);
    
    await userRef.update({
        credits: FieldValue.increment(creditsToAdd),
        updatedAt: new Date().toISOString(),
    });
    
    const updatedUser = await userRef.get();
    return updatedUser.data()?.credits ?? 0;
}

export async function deductUserCredits(userId: string, creditsToDeduct: number): Promise<number> {
    const userRef = adminDb.collection('users').doc(userId);

    return await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error("User not found");
        }
        
        const currentCredits = userDoc.data()?.credits ?? 0;
        
        if (currentCredits < creditsToDeduct) {
            throw new Error("Insufficient credits. Please purchase more credits to continue.");
        }
        
        const newBalance = currentCredits - creditsToDeduct;
        transaction.update(userRef, { 
            credits: newBalance,
            updatedAt: new Date().toISOString() 
        });
        
        return newBalance;
    });
}

// === Transaction Queries ===

export async function createTransaction(data: Omit<TransactionData, 'createdAt' | 'id'>) {
    const transactionRef = adminDb.collection('transactions').doc();
    await transactionRef.set({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return { id: transactionRef.id };
}

export async function getTransactionsByStatus({ status, limit, lastVisibleId }: { status: 'pending' | 'verified' | 'rejected', limit: number, lastVisibleId?: string }): Promise<{ transactions: TransactionData[], hasNextPage: boolean, lastVisibleId?: string | null }> {
    let query = adminDb.collection('transactions')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit + 1);

    if (lastVisibleId) {
        const lastDoc = await adminDb.collection('transactions').doc(lastVisibleId).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
    }
    
    const snapshot = await query.get();
    
    const transactions = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as TransactionData));
    const hasNextPage = snapshot.docs.length > limit;
    const newLastVisibleId = hasNextPage ? transactions[transactions.length - 1].id : null;

    return { transactions, hasNextPage, lastVisibleId: newLastVisibleId };
}


export async function getTransactionsByUserId(userId: string): Promise<TransactionData[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionData);
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionData[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionData);
}

// --- Team Queries ---

export async function getUserTeams(userId: string) {
    const userProfile = await getUserProfile(userId);
    if (!userProfile?.teams || userProfile.teams.length === 0) {
        return [];
    }

    const teamPromises = userProfile.teams.map(async (teamId) => {
        const teamDoc = await adminDb.collection('teams').doc(teamId).get();
        if (!teamDoc.exists) return null;
        
        const teamData = { id: teamDoc.id, ...teamDoc.data() } as Team;

        const membersSnapshot = await adminDb.collection('teams').doc(teamId).collection('members').get();
        const members = membersSnapshot.docs.map(doc => doc.data() as TeamMember);

        return { ...teamData, members };
    });

    const teams = await Promise.all(teamPromises);
    return teams.filter(team => team !== null);
}


export async function createTeamForUser(userId: string, teamName: string): Promise<Team> {
  const teamRef = adminDb.collection('teams').doc();
  const userRef = adminDb.collection('users').doc(userId);
  const userProfile = await getUserProfile(userId);
  if (!userProfile) throw new Error("User not found.");
  
  const newTeam: Omit<Team, 'id'> = {
      name: teamName,
      ownerId: userId,
      createdAt: new Date().toISOString(),
  };

  const newMember: TeamMember = {
      userId,
      teamId: teamRef.id,
      role: 'owner',
      joinedAt: new Date().toISOString(),
      name: userProfile.name,
      email: userProfile.email,
      profilePictureUrl: userProfile.profilePictureUrl || ''
  };

  const batch = adminDb.batch();
  batch.set(teamRef, newTeam);
  batch.set(teamRef.collection('members').doc(userId), newMember);
  batch.update(userRef, { teams: FieldValue.arrayUnion(teamRef.id) });

  await batch.commit();

  return { id: teamRef.id, ...newTeam };
}

// --- Agent Queries ---
export async function getAgent(agentId: string): Promise<AgentData | null> {
    try {
        const agentDoc = await adminDb.collection('agents').doc(agentId).get();
        
        if (agentDoc.exists) {
            return agentDoc.data() as AgentData;
        }
        
        // Fallback to default if not in DB, which is useful during development
        // or if seeding hasn't occurred.
        const defaultAgent = defaultAgents.find(a => a.id === agentId);
        return defaultAgent || null;

    } catch (error) {
        console.error(`Error fetching agent configuration for '${agentId}':`, error);
        // Fallback to local config on error to ensure app stability
        const defaultAgent = defaultAgents.find(a => a.id === agentId);
        return defaultAgent || null;
    }
}
