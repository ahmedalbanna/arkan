
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AGENTS as initialAgents, type Agent, type AgentPrompt } from '@/lib/agents';

const AGENTS_KEY = 'arkan-agents-state';

function isAgentPrompt(prompt: any): prompt is AgentPrompt {
    return typeof prompt === 'object' && prompt !== null && 'base' in prompt;
}

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
            // Merge stored data, preserving non-serializable icon and structure of prompt
            const mergedPrompt = (isAgentPrompt(initialAgent.prompt) && isAgentPrompt(storedData.prompt))
              ? { ...initialAgent.prompt, base: storedData.prompt.base }
              : storedData.prompt;

            return { ...initialAgent, ...storedData, icon: initialAgent.icon, prompt: mergedPrompt };
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
        const agentsToStore = updatedAgents.map(agent => {
            if (isAgentPrompt(agent.prompt)) {
                // Only store the base part of the complex prompt object to avoid overwriting guidelines
                return { ...agent, prompt: { base: agent.prompt.base } };
            }
            return agent;
        });
      localStorage.setItem(AGENTS_KEY, JSON.stringify(agentsToStore));
    } catch (error) {
      console.error('Failed to save agents to localStorage', error);
    }
  };

  const updateAgent = useCallback((id: string, data: Partial<Omit<Agent, 'id' | 'prompt'>> & { prompt?: string }) => {
    setAgents(prevAgents => {
        const updatedAgents = prevAgents.map(agent => {
            if (agent.id === id) {
                const newAgent = { ...agent, ...data };
                // If the prompt is a string, update the base of the complex prompt object if it exists
                if (typeof data.prompt === 'string' && isAgentPrompt(agent.prompt)) {
                    newAgent.prompt = { ...agent.prompt, base: data.prompt };
                } else if (typeof data.prompt === 'string') {
                    // This case handles agents with simple string prompts
                    newAgent.prompt = data.prompt;
                }
                return newAgent;
            }
            return agent;
        });
        saveAgents(updatedAgents);
        return updatedAgents;
    });
}, []);


  const getAgent = useCallback((id: string): Agent | undefined => {
    return agents.find(agent => agent.id === id);
  }, [agents]);


  return { agents, isLoaded, updateAgent, getAgent };
}
