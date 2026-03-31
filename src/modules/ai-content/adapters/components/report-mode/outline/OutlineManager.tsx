'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast, useBuilderStore } from '@/hooks';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { FloatingOutline } from '../FloatingOutline';

interface OutlineManagerProps {
    isVisible: boolean;
    project: Project | null;
    activeChapterId: string | null;
    selectedSectionIds: string[];
    onActiveChapterChange: (id: string | null) => void;
    onActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
}

export const OutlineManager = ({
    isVisible,
    project,
    activeChapterId,
    selectedSectionIds,
    onActiveChapterChange,
    onActiveSectionChange
}: OutlineManagerProps) => {
    const updateProject = useBuilderStore(state => state.updateProject);
    const undo = useBuilderStore(state => state.undo);
    const [outlineClipboard, setOutlineClipboard] = useState<{ type: 'chapter' | 'section', data: any } | null>(null);

    if (!project) return null;

    return (
        <FloatingOutline
            isVisible={isVisible}
            project={project}
            activeChapterId={activeChapterId}
            selectedSectionIds={selectedSectionIds}
            onActiveChapterChange={onActiveChapterChange}
            onActiveSectionChange={onActiveSectionChange}
            onMoveItem={(activeId, overId) => updateProject(p => p.moveContentItem(activeId, overId))}
            onUpdateTitle={(id, newTitle, isChapter) => {
                if (isChapter) {
                    updateProject(p => p.updateChapter(id, c => c.withProps({ title: newTitle })));
                } else {
                    updateProject(p => p.updateSection(id, s => s.withProps({ title: newTitle })));
                }
            }}
            onDeleteItem={(id, isChapter) => {
                if (isChapter) {
                    updateProject(p => p.removeChapter(id));
                } else {
                    const sectionInfo = project.findSection(id);
                    if (sectionInfo) {
                        updateProject(p => p.updateChapter(sectionInfo.chapter.id, c => c.removeSection(id)));
                    }
                }
            }}
            onAddChapter={() => {
                updateProject(p => p.addChapter(uuidv4(), "New Chapter"));
            }}
            onAddSection={(chapterId) => {
                updateProject(p => p.addSectionToChapter(chapterId, uuidv4(), "New Section"));
            }}
            onDuplicateItem={(id, isChapter) => {
                updateProject(p => isChapter ? p.duplicateChapter(id, uuidv4) : p.duplicateSection(id, uuidv4));
            }}
            onUndo={() => undo()}
            onCopyItem={(id, isChapter) => {
                if (isChapter) {
                    const chapter = project.getChapter(id);
                    if (chapter) setOutlineClipboard({ type: 'chapter', data: chapter.toProperties() });
                } else {
                    const info = project.findSection(id);
                    if (info) setOutlineClipboard({ type: 'section', data: info.section.toProperties() });
                }
                toast({ title: 'Copied', description: 'Item copied to outline clipboard.' });
            }}
            onPasteItem={(targetId, targetIsChapter) => {
                if (!outlineClipboard) return;

                updateProject(p => {
                    const newId = uuidv4();

                    // CASE 1: Pasting a CHAPTER
                    if (outlineClipboard.type === 'chapter') {
                        const newChapterProps = {
                            ...outlineClipboard.data,
                            id: newId,
                            title: `${outlineClipboard.data.title} (Copy)`
                        };
                        if (newChapterProps.sections) {
                            newChapterProps.sections = newChapterProps.sections.map((s: any) => ({ ...s, id: uuidv4() }));
                        }
                        const newChapter = new Chapter(newChapterProps);

                        // Find insertion index
                        let insertionIndex = -1;
                        if (targetIsChapter) {
                            insertionIndex = p.content.findIndex(c => c.id === targetId);
                        } else {
                            const info = p.findSection(targetId);
                            if (info) insertionIndex = p.content.findIndex(c => c.id === info.chapter.id);
                        }

                        if (insertionIndex !== -1) {
                            const newContent = [...p.content];
                            newContent.splice(insertionIndex + 1, 0, newChapter);
                            return p.withProps({ content: newContent });
                        }
                    }

                    // CASE 2: Pasting a SECTION
                    else if (outlineClipboard.type === 'section') {
                        const newSectionProps = {
                            ...outlineClipboard.data,
                            id: newId,
                            title: `${outlineClipboard.data.title} (Copy)`
                        };
                        const newSection = new Section(newSectionProps);

                        if (targetIsChapter) {
                            // Paste as first section of the chapter
                            return p.updateChapter(targetId, c => c.addSection(newSection, 0));
                        } else {
                            // Paste below the target section
                            const info = p.findSection(targetId);
                            if (info) {
                                return p.updateChapter(info.chapter.id, c => c.addSection(newSection, info.sectionIndex + 1));
                            }
                        }
                    }
                    return p;
                });
                toast({ title: 'Pasted', description: `Successfully pasted ${outlineClipboard.type}.` });
            }}
        />
    );
};
