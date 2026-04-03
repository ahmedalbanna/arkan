'use client';

import React from 'react';
import { cn } from '@/infrastructure/utils/cn';
import { BuilderCanvas } from '../layout/BuilderCanvas';
import ReportResults from '../../report-mode/ReportResults';
import { FloatingOutline } from '../../report-mode/FloatingOutline';

interface DocumentCanvasProps {
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    isOutlineVisible: boolean;
    setIsOutlineVisible: (visible: boolean) => void;
    viewMode: 'edit' | 'preview';
    setViewMode: (mode: 'edit' | 'preview') => void;
    activeChapterId: string | null;
    setActiveChapterId: (id: string | null) => void;
    selectedSectionIds: string[];
    handleActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
    activeRightPanelKey: string;
    project: any;
    // ... all other props passed from Workspace
    [key: string]: any;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    isOutlineVisible,
    setIsOutlineVisible,
    viewMode,
    setViewMode,
    activeChapterId,
    setActiveChapterId,
    selectedSectionIds,
    handleActiveSectionChange,
    activeRightPanelKey,
    project,
    ...rest
}) => {
    return (
        <BuilderCanvas
            zoomLevel={zoomLevel}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onZoomReset={onZoomReset}
            floatingElements={
                <FloatingOutline 
                    isVisible={isOutlineVisible}
                    project={project}
                    activeChapterId={activeChapterId}
                    selectedSectionIds={selectedSectionIds}
                    onActiveChapterChange={setActiveChapterId}
                    onActiveSectionChange={(id) => handleActiveSectionChange(id)}
                    onMoveItem={rest.handleMoveItem}
                    onUpdateTitle={rest.handleUpdateTitle}
                    onDeleteItem={rest.handleDeleteItem}
                    onAddChapter={rest.handleAddChapter}
                    onAddSection={rest.handleAddSection}
                    onDuplicateItem={rest.handleDuplicateItem}
                    onUndo={rest.handleUndo}
                    onCopyItem={rest.handleCopyItem}
                    onPasteItem={rest.handlePasteItem}
                />
            }
        >
            <ReportResults
                activeChapterId={activeChapterId}
                setActiveChapterId={setActiveChapterId}
                selectedSectionIds={selectedSectionIds}
                handleActiveSectionChange={handleActiveSectionChange}
                isOutlineVisible={isOutlineVisible}
                setIsOutlineVisible={setIsOutlineVisible}
                viewMode={viewMode}
                setViewMode={setViewMode}
                zoomLevel={zoomLevel}
                activeRightPanelKey={activeRightPanelKey}
                summarizeMutation={rest.summarizeMutation}
                expandMutation={rest.expandMutation}
                rewriteMutation={rest.rewriteMutation}
                rewriteStyles={rest.rewriteStyles}
            />
        </BuilderCanvas>
    );
};
