'use client';

import type { Agent } from '@/types/agent';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Cache configuration
const CACHE_KEY = 'arkan_agents_cache';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const LAST_FETCH_KEY = 'arkan_agents_last_fetch';

interface AgentResponse {
  prompt: string;
  response: string;
}

// Maps: AgentID -> CommandID -> Responses[]
type ResponseMap = Record<string, Record<string, AgentResponse[]>>;

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  selectedCommandId: string | null;
  responses: ResponseMap;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  searchCache: Map<string, Agent[]>;

  // Actions
  loadInitialAgents: () => Promise<void>;
  refreshAgentsFromApi: () => Promise<void>;
  selectAgent: (agentId: string | null) => void;
  setSelectedCommandId: (commandId: string) => void;
  setResponse: (agentId: string, commandId: string, response: AgentResponse) => void;
  clearResponses: (agentId: string, commandId?: string) => void;
  searchAgents: (searchTerm: string) => Agent[];
  getAgentsByCategory: (category: string) => Agent[];
  clearCache: () => void;
}

// Check if cache is still valid
const isCacheValid = (): boolean => {
  const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
  if (!lastFetch) return false;

  const timeDiff = Date.now() - parseInt(lastFetch);
  return timeDiff < CACHE_EXPIRY_MS;
};

// Get cached agents
const getCachedAgents = (): Agent[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.warn('Failed to parse cached agents:', error);
    return [];
  }
};

// Save agents to cache
const setCachedAgents = (agents: Agent[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(agents));
    localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to cache agents:', error);
  }
};

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      selectedCommandId: null,
      responses: {},
      isLoading: false,
      error: null,
      lastFetch: null,
      searchCache: new Map(),

      loadInitialAgents: async () => {
        // Check cache first for instant loading
        if (typeof window !== 'undefined') {
          const cachedAgents = getCachedAgents();
          if (cachedAgents.length > 0 && isCacheValid()) {
            console.log(`Loading ${cachedAgents.length} agents from cache (instant)`);
            set({
              agents: cachedAgents,
              isLoading: false,
              error: null,
              lastFetch: parseInt(localStorage.getItem(LAST_FETCH_KEY) || '0')
            });

            // Auto-select first agent if none selected
            if (!get().selectedAgent) {
              get().selectAgent(cachedAgents[0].id);
            }
            return;
          }
        }

        // Load from API if cache is invalid or empty
        set({ isLoading: true, error: null });

        try {
          console.log('Loading agents from API...');
          const response = await fetch('/api/agents', {
            headers: {
              'Cache-Control': 'max-age=300', // 5 minutes browser cache
            }
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
          }

          const agentsFromApi = await response.json();
          const agents = Array.isArray(agentsFromApi) ? agentsFromApi : agentsFromApi.agents || [];

          if (agents.length === 0) {
            throw new Error('No agents found in API response');
          }

          console.log(`Successfully loaded ${agents.length} agents from API`);

          // Cache the results for next time
          setCachedAgents(agents);

          set({
            agents,
            isLoading: false,
            error: null,
            lastFetch: Date.now(),
            searchCache: new Map() // Clear search cache when data changes
          });

          // Auto-select first agent if none selected
          if (!get().selectedAgent && agents.length > 0) {
            get().selectAgent(agents[0].id);
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load agents';
          console.error('Error loading agents:', errorMessage);

          // Try to fall back to cached data even if expired
          const cachedAgents = getCachedAgents();
          if (cachedAgents.length > 0) {
            console.log('Using expired cache as fallback');
            set({
              agents: cachedAgents,
              isLoading: false,
              error: `Using cached data (${errorMessage})`
            });
          } else {
            set({
              agents: [],
              isLoading: false,
              error: errorMessage
            });
          }
        }
      },

      refreshAgentsFromApi: async () => {
        // Force refresh by clearing cache
        get().clearCache();
        await get().loadInitialAgents();
      },

      searchAgents: (searchTerm: string) => {
        if (!searchTerm.trim()) {
          return get().agents;
        }

        // Check search cache first (read-only)
        const { searchCache, agents } = get();
        const cacheKey = searchTerm.toLowerCase();
        if (searchCache.has(cacheKey)) {
          return searchCache.get(cacheKey) || [];
        }

        // Perform search (pure function)
        const results = agents.filter(agent => {
          const name = agent.name.toLowerCase();
          const description = (agent.description || agent.data?.description || '').toLowerCase();
          const category = (agent.category || '').toLowerCase();
          const tags = (agent.tags || []).join(' ').toLowerCase();
          const commands = (agent.commands || agent.data?.commands || [])
            .map(cmd => (cmd.name + ' ' + (cmd.description || '')).toLowerCase())
            .join(' ');

          const searchText = `${name} ${description} ${category} ${tags} ${commands}`;
          return searchText.includes(searchTerm.toLowerCase());
        });

        // Cache the search results asynchronously to avoid render issues
        setTimeout(() => {
          const currentCache = get().searchCache;
          const newSearchCache = new Map(currentCache);
          newSearchCache.set(cacheKey, results);
          set({ searchCache: newSearchCache });
        }, 0);

        return results;
      },

      getAgentsByCategory: (category: string) => {
        return get().agents.filter(agent =>
          (agent.category || '').toLowerCase() === category.toLowerCase()
        );
      },

      clearCache: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(LAST_FETCH_KEY);
        }
        set({ searchCache: new Map(), lastFetch: null });
      },

      selectAgent: (agentId) => {
        if (agentId === null) {
          set({ selectedAgent: null, selectedCommandId: null });
          return;
        }
        const agent = get().agents.find(a => a.id === agentId);
        if (agent) {
          // Handle both old format (agent.data.commands) and new format (agent.commands)
          const commands = agent.commands || agent.data?.commands || [];
          const firstCommandId = commands[0]?.id || null;
          set({ selectedAgent: agent, selectedCommandId: firstCommandId });
        }
      },

      setSelectedCommandId: (commandId) => {
        set({ selectedCommandId: commandId });
      },

      setResponse: (agentId, commandId, response) => {
        set(state => {
          const newResponses = { ...state.responses };
          if (!newResponses[agentId]) {
            newResponses[agentId] = {};
          }
          if (!newResponses[agentId][commandId]) {
            newResponses[agentId][commandId] = [];
          }
          newResponses[agentId][commandId].push(response);
          return { responses: newResponses };
        });
      },

      clearResponses: (agentId, commandId) => {
        set(state => {
          const newResponses = { ...state.responses };
          if (newResponses[agentId]) {
            if (commandId) {
              delete newResponses[agentId][commandId];
            } else {
              delete newResponses[agentId];
            }
          }
          return { responses: newResponses };
        });
      },
    }),
    {
      name: 'agent-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAgent: state.selectedAgent,
        selectedCommandId: state.selectedCommandId,
        responses: state.responses,
      }),
    }
  )
);
