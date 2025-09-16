
import { adminDb } from '@/lib/firebase/server-init';
import { AgentProperties } from '@/lib/models/agent';


let allAgents: AgentProperties[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

/**
 * Fetches all enabled agents from Firestore using the Admin SDK.
 * Implements a simple in-memory cache to reduce Firestore reads.
 * @returns A promise that resolves to an array of Agent objects.
 */
export async function getEnabledAgents(): Promise<AgentProperties[]> {
  const now = Date.now();
  // Return cached data if it's not stale
  if (allAgents && (now - lastFetchTimestamp < CACHE_DURATION)) {
    return allAgents;
  }

  try {
    const agentsCollectionRef = adminDb.collection('agents');
    const q = agentsCollectionRef.where("isEnabled", "==", true);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return [];
    }

    const fetchedAgents: AgentProperties[] = [];
    querySnapshot.forEach((doc) => {
      // We cast to Agent, assuming the data in Firestore matches the type.
      // Add validation here if needed (e.g., with Zod).
      fetchedAgents.push({ id: doc.id, ...doc.data() } as AgentProperties);
    });
    
    // Update cache
    allAgents = fetchedAgents;
    lastFetchTimestamp = now;

    return fetchedAgents;
  } catch (error) {
    console.error("Error fetching enabled agents with Admin SDK:", error);
    // In case of an error, return an empty array or re-throw, depending on desired behavior.
    return [];
  }
}
