import { renderHook, act } from '@testing-library/react';
import { useReportStore } from '@/hooks/useReportStore';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { AGENTS } from '@/lib/agents';
import { sectionConfig } from '@/lib/report-config';
import { useBuilderStore } from '@/hooks/useBuilderStore';

// Mock useBuilderStore
jest.mock('@/hooks/useBuilderStore', () => ({
    useBuilderStore: {
        getState: jest.fn(() => ({
            setHasUnsavedChanges: jest.fn(),
        })),
    },
}));

describe('useReportStore', () => {
    beforeEach(() => {
        // Reset the store before each test
        const { result } = renderHook(() => useReportStore());
        act(() => {
            result.current.newSession();
        });
    });

    it('should initialize with the correct initial state', () => {
        const { result } = renderHook(() => useReportStore());
        const initialState = {
            sections: {},
            evaluation: null,
            externalContext: null,
            guidelineState: expect.any(Object),
            controlState: expect.any(Object),
            customGuidelineInput: {},
            contextSelection: {},
            selectedReportTemplateId: REPORT_GENERATION_TEMPLATES[0].id,
            selectedPresentationTemplateId: 'software-presentation',
        };
        expect(result.current).toMatchObject(initialState);
    });

    it('should set a section', () => {
        const { result } = renderHook(() => useReportStore());
        const sectionKey = Object.keys(sectionConfig)[0];
        const content = 'Test content';

        act(() => {
            result.current.setSection(sectionKey, content);
        });

        expect(result.current.sections[sectionKey]).toBe(content);
        expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should set all sections', () => {
        const { result } = renderHook(() => useReportStore());
        const newSections = {
            [Object.keys(sectionConfig)[0]]: 'Content 1',
            [Object.keys(sectionConfig)[1]]: 'Content 2',
        };

        act(() => {
            result.current.setAllSections(newSections);
        });

        expect(result.current.sections).toEqual(expect.objectContaining(newSections));
        expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should set the evaluation', () => {
        const { result } = renderHook(() => useReportStore());
        const evaluation = { overallScore: 0.8, feedback: 'Good job!' };

        act(() => {
            result.current.setEvaluation(evaluation);
        });

        expect(result.current.evaluation).toEqual(evaluation);
        expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should set the external context', () => {
        const { result } = renderHook(() => useReportStore());
        const fileName = 'test.txt';
        const content = 'External context content';

        act(() => {
            result.current.setExternalContext(fileName, content);
        });

        expect(result.current.externalContext).toEqual({ fileName, content });
        expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should remove the external context', () => {
        const { result } = renderHook(() => useReportStore());
        act(() => {
            result.current.setExternalContext('test.txt', 'External context content');
            result.current.removeExternalContext();
        });

        expect(result.current.externalContext).toBeNull();
        expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    describe('Control State', () => {
        it('should handle control change', () => {
            const { result } = renderHook(() => useReportStore());
            const sectionKey = Object.keys(sectionConfig)[0];
            const control = 'formality';
            const value = 75;

            act(() => {
                result.current.handleControlChange(sectionKey, control, value);
            });

            expect(result.current.controlState[sectionKey].formality).toBe(value);
            expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
        });
    });

    describe('Guideline State', () => {
        it('should handle guideline toggle', () => {
            const { result } = renderHook(() => useReportStore());
            const agent = AGENTS[0];
            const itemKey = agent.id.replace('generate-', '').replace('-section', '').replace('-diagram', '');
            const index = 0;
            const checked = true;

            act(() => {
                result.current.handleGuidelineToggle(itemKey, index, checked);
            });

            expect(result.current.guidelineState[itemKey].checked[index]).toBe(checked);
            expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
        });

        it('should set custom guideline input for item', () => {
            const { result } = renderHook(() => useReportStore());
            const itemKey = 'test-item';
            const value = 'Custom guideline input';

            act(() => {
                result.current.setCustomGuidelineInputForItem(itemKey, value);
            });

            expect(result.current.customGuidelineInput[itemKey]).toBe(value);
        });

        it('should add a custom guideline for item', () => {
            const { result } = renderHook(() => useReportStore());
            const itemKey = 'test-item';
            const guidelineInput = 'Custom guideline';

            act(() => {
                result.current.setCustomGuidelineInputForItem(itemKey, guidelineInput);
                result.current.handleAddCustomGuidelineForItem(itemKey);
            });

            expect(result.current.guidelineState[itemKey].custom).toContain(guidelineInput);
            expect(result.current.customGuidelineInput[itemKey]).toBe('');
            expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
        });

        it('should remove a custom guideline for item', () => {
            const { result } = renderHook(() => useReportStore());
            const itemKey = 'test-item';
            const guideline = 'Custom guideline';

            act(() => {
                result.current.setCustomGuidelineInputForItem(itemKey, guideline);
                result.current.handleAddCustomGuidelineForItem(itemKey);
            });

            const indexToRemove = 0;

            act(() => {
                result.current.handleRemoveCustomGuidelineForItem(itemKey, indexToRemove);
            });

            expect(result.current.guidelineState[itemKey].custom).not.toContain(guideline);
            expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
        });
    });

    describe('Context Selection', () => {
        it('should toggle context selection', () => {
            const { result } = renderHook(() => useReportStore());
            const itemKey = 'test-item';
            const type = 'sections';
            const contextKey = 'section1';
            const isSelected = true;

            act(() => {
                result.current.toggleContextSelection(itemKey, type, contextKey, isSelected);
            });

            expect(result.current.contextSelection[itemKey].sections[contextKey]).toBe(isSelected);
            expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
        });
    });

    describe('Template Selection', () => {
        it('should set the selected report template ID', () => {
            const { result } = renderHook(() => useReportStore());
            const templateId = 'new-template-id';

            act(() => {
                result.current.setSelectedReportTemplateId(templateId);
            });

            expect(result.current.selectedReportTemplateId).toBe(templateId);
            expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
        });

        it('should set the selected presentation template ID', () => {
            const { result } = renderHook(() => useReportStore());
            const templateId = 'new-presentation-template-id';

            act(() => {
                result.current.setSelectedPresentationTemplateId(templateId);
            });

            expect(result.current.selectedPresentationTemplateId).toBe(templateId);
            expect(useBuilderStore.getState().setHasUnsavedChanges).toHaveBeenCalledWith(true);
        });
    });

    it('should load state', () => {
        const { result } = renderHook(() => useReportStore());
        const newState = {
            sections: { section1: 'loaded content' },
            evaluation: { overallScore: 0.9, feedback: 'Excellent!' },
            externalContext: { fileName: 'loaded.txt', content: 'Loaded content' }
        };

        act(() => {
            result.current.loadState(newState);
        });

        expect(result.current.sections).toEqual(expect.objectContaining(newState.sections));
        expect(result.current.evaluation).toEqual(newState.evaluation);
        expect(result.current.externalContext).toEqual(newState.externalContext);
    });
});
