
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReportState } from '@/app/generate-report/actions';
import type { ProjectProposal } from '@/ai/schemas';
import { ProjectProposalSchema, SectionNameSchema, DiagramTypeSchema, type SectionName, type DiagramType } from '@/ai/schemas';
import { useHistory } from '@/hooks/use-history';
import { sectionConfig, diagramConfig } from '@/lib/report-config';

const STORAGE_KEY = 'arkan-report-generator-state';

export function useReportBuilder() {
  const [state, setState] = useState<ReportState>({ sections: {}, diagrams: {} });
  const [projectIdea, setProjectIdea] = useState('');
  const [proposalJson, setProposalJson] = useState('');
  const [proposal, setProposal] = useState<ProjectProposal | null>(null);
  const [contextSelections, setContextSelections] = useState<Record<string, Record<string, boolean>>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const { addHistoryEntry } = useHistory();

  // Load from local storage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState({
          sections: parsed.sections || {},
          diagrams: parsed.diagrams || {},
          presentation: parsed.presentation || undefined,
          lastGenerated: parsed.lastGenerated,
          externalContext: parsed.externalContext || undefined,
        });
        const savedProposalJson = parsed.proposalJson || '';
        setProposalJson(savedProposalJson);
        if (savedProposalJson) {
          try {
            const parsedProposal = ProjectProposalSchema.parse(JSON.parse(savedProposalJson));
            setProposal(parsedProposal);
          } catch {
            setProposal(null);
          }
        }
        setProjectIdea(parsed.projectIdea || '');
        setContextSelections(parsed.contextSelections || {});
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        sections: state.sections,
        diagrams: state.diagrams,
        presentation: state.presentation,
        lastGenerated: state.lastGenerated,
        externalContext: state.externalContext,
        proposalJson: proposalJson,
        projectIdea: projectIdea,
        contextSelections: contextSelections,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state, proposalJson, projectIdea, isLoaded, contextSelections]);

  const handleNewSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ sections: {}, diagrams: {} });
    setProposalJson('');
    setProjectIdea('');
    setProposal(null);
    setContextSelections({});
  }, []);

  const processGeneratedItem = useCallback((newState: ReportState) => {
    setState(newState);

    if (!newState.lastGenerated) return;

    let proposalTitle = 'Project Report';
    try {
      const parsed = JSON.parse(proposalJson);
      if (parsed && parsed.title) {
        proposalTitle = parsed.title;
      }
    } catch (e) { /* ignore */ }

    const lastItemKey = newState.lastGenerated;

    if (SectionNameSchema.options.includes(lastItemKey as SectionName)) {
      const section = lastItemKey as SectionName;
      const historyEntry = {
        id: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: 'report' as const,
        title: `Report Section: ${sectionConfig[section].title}`,
        proposalTitle,
        section: section,
        content: newState.sections[section]!,
      };
      addHistoryEntry(historyEntry);
    } else if (DiagramTypeSchema.options.includes(lastItemKey as DiagramType)) {
      const diagram = lastItemKey as DiagramType;
      const diagramData = newState.diagrams?.[diagram];
      if (diagramData) {
        const historyEntry = {
          id: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          type: 'diagram' as const,
          title: `Diagram: ${diagramConfig[diagram].title}`,
          diagramType: diagram,
          plantUmlCode: diagramData.plantUmlCode,
          imageUrl: diagramData.imageUrl,
          proposalTitle,
        };
        addHistoryEntry(historyEntry);
      }
    }
  }, [addHistoryEntry, proposalJson]);

  const toggleContextSelection = useCallback((parentKey: string, contextKey: string) => {
    setContextSelections(prev => {
      const newSelections = JSON.parse(JSON.stringify(prev));
      if (!newSelections[parentKey]) {
        newSelections[parentKey] = {};
      }
      newSelections[parentKey][contextKey] = !newSelections[parentKey][contextKey];
      return newSelections;
    });
  }, []);

  const setExternalContext = useCallback((fileName: string, content: string) => {
    setState(prev => ({
      ...prev,
      externalContext: { fileName, content }
    }));
  }, []);

  const removeExternalContext = useCallback(() => {
    setState(prev => {
      const { externalContext, ...rest } = prev;
      return rest;
    });
  }, []);


  return {
    isLoaded,
    state,
    setState: processGeneratedItem,
    projectIdea,
    setProjectIdea,
    proposal,
    setProposal,
    proposalJson,
    setProposalJson,
    handleNewSession,
    contextSelections,
    toggleContextSelection,
    setExternalContext,
    removeExternalContext,
  };
}
