
'use client';

import { Agent } from '@/hooks';
import type { GuidelineState } from '@/hooks';
import { AgentPrompt } from '@/lib/models/agent';

/**
 * Extracts the selected default and custom guidelines for a given agent based on the UI state.
 * @param agent - The agent configuration object.
 * @param guidelineState - The state of checked and custom guidelines for this agent.
 * @returns An array of strings representing the active guidelines.
 */
export const getSelectedGuidelines = (
  agent: Agent | undefined,
  guidelineState: GuidelineState | undefined,
): string[] => {
  if (!agent || !guidelineState) {
    return guidelineState?.custom || [];
  }

  const promptConfig = agent.prompt as AgentPrompt;
  // If the agent has a simple string prompt or no default guidelines, only return custom ones.
  if (typeof promptConfig === 'string' || !promptConfig.guidelines) {
    return guidelineState.custom || [];
  }

  const guidelines: string[] = [];

  // Add checked default guidelines
  promptConfig.guidelines.forEach((g, index) => {
    if (guidelineState.checked[index]) {
      guidelines.push(g.text);
    }
  });

  // Add all custom guidelines
  if (guidelineState.custom) {
    guidelines.push(...guidelineState.custom);
  }

  return guidelines;
};
