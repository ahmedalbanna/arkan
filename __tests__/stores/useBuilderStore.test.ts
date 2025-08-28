
import { useBuilderStore } from '@/hooks';
import { act } from '@testing-library/react';

const mockProposal = {
  title: "Test Proposal",
  objective: "To test the store",
  category: "Testing",
  methodology: "Agile",
  expected_outcome: ["Tested"],
  timeline: { startDate: "2024-01-01", endDate: "2024-12-31", phases: [] },
  budget: { totalAmount: 1000, currency: "USD", breakdown: [] },
  evaluation: "Test evaluation",
  risks: [],
};

describe('useBuilderStore', () => {
    beforeEach(() => {
        // Reset the store to its initial state before each test
        act(() => {
            useBuilderStore.getState().newSession();
        });
    });

    it('should set the project idea and mark unsaved changes', () => {
        const idea = 'My new project idea';
        act(() => {
            useBuilderStore.getState().setProjectIdea(idea);
        });

        const state = useBuilderStore.getState();
        expect(state.projectIdea).toBe(idea);
        expect(state.hasUnsavedChanges).toBe(true);
    });

    it('should set a new proposal and mark unsaved changes', () => {
        act(() => {
            useBuilderStore.getState().setProposal(mockProposal);
        });

        const state = useBuilderStore.getState();
        expect(state.proposal).toEqual(mockProposal);
        expect(state.hasUnsavedChanges).toBe(true);
    });

    it('should handle proposal updates correctly', () => {
        act(() => {
            useBuilderStore.getState().setProposal(mockProposal);
        });

        const newTitle = "Updated Test Proposal";
        act(() => {
            useBuilderStore.getState().handleProposalUpdate('title', newTitle);
        });

        expect(useBuilderStore.getState().proposal?.title).toBe(newTitle);
        expect(useBuilderStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('should reset to initial state on newSession', () => {
        act(() => {
            useBuilderStore.getState().setProjectIdea('some idea');
            useBuilderStore.getState().newSession();
        });

        const state = useBuilderStore.getState();
        expect(state.projectIdea).toBe("");
        expect(state.proposal).toBeNull();
        expect(state.hasUnsavedChanges).toBe(false);
    });

    it('should load a full project state', () => {
        const fullState = {
            id: 'proj-123',
            name: 'Loaded Project',
            projectIdea: 'Loaded idea',
            proposal: mockProposal,
            sections: { introduction: "Test intro" },
        };

        act(() => {
            useBuilderStore.getState().loadState(fullState as any);
        });

        const state = useBuilderStore.getState();
        expect(state.currentProjectId).toBe('proj-123');
        expect(state.name).toBe('Loaded Project');
        expect(state.proposal?.title).toBe(mockProposal.title);
        expect(state.hasUnsavedChanges).toBe(false); // Should be false after loading
    });
});
