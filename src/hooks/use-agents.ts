'use client';

import { useState, useEffect, useCallback } from 'react';
import { AGENTS as initialAgents, type Agent } from '@/lib/agents';

const AGENTS_KEY = 'arkan-agents-state';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedAgents = localStorage.getItem(AGENTS_KEY);
      if (storedAgents) {
        const parsedAgents: Agent[] = JSON.parse(storedAgents);
        const agentMap = new Map(parsedAgents.map(a => [a.id, a]));
        const mergedAgents = initialAgents.map(initialAgent => {
          const storedData = agentMap.get(initialAgent.id);
          if (storedData) {
            // Merge stored data, but explicitly preserve the non-serializable icon from the code definition.
            return { ...initialAgent, ...storedData, icon: initialAgent.icon };
          }
          return initialAgent;
        });
        setAgents(mergedAgents);
      } else {
        setAgents(initialAgents);
      }
    } catch (error) {
      console.error('Failed to load agents from localStorage', error);
      setAgents(initialAgents);
    }
    setIsLoaded(true);
  }, []);

  const saveAgents = (updatedAgents: Agent[]) => {
    setAgents(updatedAgents);
    try {
      localStorage.setItem(AGENTS_KEY, JSON.stringify(updatedAgents));
    } catch (error) {
      console.error('Failed to save agents to localStorage', error);
    }
  };

  const updateAgent = useCallback((id: string, data: Partial<Omit<Agent, 'id'>>) => {
    setAgents(prevAgents => {
      const updatedAgents = prevAgents.map(agent =>
        agent.id === id ? { ...agent, ...data } : agent
      );
      saveAgents(updatedAgents);
      return updatedAgents;
    });
  }, []);

  const getAgent = useCallback((id: string): Agent | undefined => {
    // This function needs to read from the state variable `agents`
    // to ensure it gets the most up-to-date data.
    return agents.find(agent => agent.id === id);
  }, [agents]);


  return { agents, isLoaded, updateAgent, getAgent };
}
