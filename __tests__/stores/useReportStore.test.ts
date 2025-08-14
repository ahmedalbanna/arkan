
import { useReportStore } from '@/hooks/useReportStore';
import { act } from '@testing-library/react';
import type { SectionName } from '@/lib/types';

describe('useReportStore', () => {
  beforeEach(() => {
    act(() => {
      useReportStore.getState().newSession();
    });
  });

  it('should set a section\'s content', () => {
    const section: SectionName = 'introduction';
    const content = 'This is the introduction.';

    act(() => {
      useReportStore.getState().setSection(section, content);
    });

    const state = useReportStore.getState();
    expect(state.sections[section]).toBe(content);
  });

  it('should remove a section\'s content', () => {
    const section: SectionName = 'introduction';
    const content = 'This is the introduction.';

    act(() => {
      useReportStore.getState().setSection(section, content);
      useReportStore.getState().removeSection(section);
    });

    const state = useReportStore.getState();
    expect(state.sections[section]).toBeUndefined();
  });

  it('should toggle a guideline correctly', () => {
    const itemKey = 'introduction';
    const guidelineIndex = 0;

    act(() => {
      // Toggle to true
      useReportStore.getState().handleGuidelineToggle(itemKey, guidelineIndex, true);
    });

    expect(useReportStore.getState().guidelineState[itemKey]?.checked[guidelineIndex]).toBe(true);

    act(() => {
      // Toggle back to false
      useReportStore.getState().handleGuidelineToggle(itemKey, guidelineIndex, false);
    });

    expect(useReportStore.getState().guidelineState[itemKey]?.checked[guidelineIndex]).toBe(false);
  });

  it('should add and remove custom guidelines', () => {
    const itemKey = 'conclusion';
    const customGuideline = 'End on a positive note.';

    act(() => {
      useReportStore.getState().setCustomGuidelineInputForItem(itemKey, customGuideline);
      useReportStore.getState().handleAddCustomGuidelineForItem(itemKey);
    });

    let state = useReportStore.getState();
    expect(state.guidelineState[itemKey].custom).toContain(customGuideline);
    expect(state.customGuidelineInput[itemKey]).toBe('');

    act(() => {
      useReportStore.getState().handleRemoveCustomGuidelineForItem(itemKey, 0);
    });
    
    state = useReportStore.getState();
    expect(state.guidelineState[itemKey].custom).not.toContain(customGuideline);
  });
  
});
