
'use client';

import A4Page from '@/components/shared/A4Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { Project } from '@/lib/models';
import { useEffect, useMemo, useState } from 'react';
import { MenuBar } from './MenuBar';
import RichTextEditor from './RichTextEditor';

/**
 * Parses a single markdown string into a Project object's chapters and sections,
 * intelligently reusing existing IDs to maintain stability.
 * @param markdown The markdown string to parse.
 * @param existingProject The existing project to merge IDs from.
 * @returns A new Project instance with the parsed structure.
 */
function parseMarkdownToProject(markdown: string, existingProject: Project): Project {
    const lines = markdown.split('\n');
    let currentChapterData: { title: string; sections: { title: string; content: string }[] } | null = null;
    let currentSectionData: { title: string; content: string } | null = null;
    let contentBuffer: string[] = [];
    const newChaptersData: { title: string; sections: { title: string; content: string }[] }[] = [];

    const flushContent = () => {
        if (contentBuffer.length > 0 && currentSectionData) {
            currentSectionData.content = contentBuffer.join('\n').trim();
        }
        contentBuffer = [];
    };

    const finalizeChapter = () => {
        flushContent();
        if (currentSectionData) {
            currentChapterData?.sections.push(currentSectionData);
            currentSectionData = null;
        }
        if (currentChapterData) {
            newChaptersData.push(currentChapterData);
            currentChapterData = null;
        }
    }

    lines.forEach(line => {
        const h1Match = line.match(/^#\s+(.*)/);
        const h2Match = line.match(/^##\s+(.*)/);

        if (h1Match) {
            finalizeChapter();
            currentChapterData = { title: h1Match[1].trim(), sections: [] };
        } else if (h2Match) {
            flushContent();
            if (currentSectionData && currentChapterData) {
                currentChapterData.sections.push(currentSectionData);
            }
            currentSectionData = { title: h2Match[1].trim(), content: '' };
        } else {
            contentBuffer.push(line);
        }
    });

    finalizeChapter();

    const finalChapters = newChaptersData.map(chData => {
        const oldChapter = existingProject.chapters.find(c => c.title === chData.title);
        const chapterId = oldChapter?.id || existingProject.generateUniqueId(chData.title, existingProject.chapters, 'chapter');
        
        const finalSections = chData.sections.map(secData => {
            const oldSection = oldChapter?.sections.find(s => s.title === secData.title) || existingProject.getSectionByTitle(secData.title);
            return {
                id: oldSection?.id || existingProject.generateUniqueId(secData.title, existingProject.sections, 'section'),
                title: secData.title,
                content: secData.content,
                type: 'report' as const
            };
        });

        return {
            id: chapterId,
            title: chData.title,
            sections: finalSections
        };
    });
    
    // If the input was empty and resulted in no chapters, but the project had empty chapters, preserve them.
    if (finalChapters.length === 0 && existingProject.chapters.length > 0 && markdown.trim() === '') {
        return existingProject;
    }


    return existingProject.with({ chapters: finalChapters });
}


export function ReportResults() {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  
  const fullMarkdownContent = useMemo(() => {
    if (!project || !project.chapters) return '';
    return project.chapters.map(chapter => {
      const sectionsMarkdown = chapter.sections.map(section => `## ${section.title}\n\n${section.content || ''}`).join('\n\n');
      return `# ${chapter.title}\n\n${sectionsMarkdown}`;
    }).join('\n\n---\n\n');
  }, [project]);
  
  const [localMarkdown, setLocalMarkdown] = useState(fullMarkdownContent);

  useEffect(() => {
    setLocalMarkdown(fullMarkdownContent);
  }, [fullMarkdownContent]);
  

  function handleContentChange(markdown: string) {
    if (!project) return;
    setLocalMarkdown(markdown);
    const updatedProject = parseMarkdownToProject(markdown, project);
    // Directly update the store without causing a loop
    useBuilderStore.setState({ project: updatedProject, hasUnsavedChanges: true });
  }

  function renderContent() {
    return (
        <A4Page>
            <RichTextEditor
              key={project?.id} // Re-mount editor when project changes
              content={localMarkdown}
              onChange={handleContentChange}
            />
        </A4Page>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
            <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="font-headline">
                    {t('builder.reportGenerator.resultsTitle')}
                    </CardTitle>
                    <CardDescription>
                    {t('builder.reportGenerator.resultsDesc')}
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50 min-h-0">
            <ScrollArea className="flex-grow">
              {renderContent()}
            </ScrollArea>
            <MenuBar />
        </CardContent>
    </Card>
  );
};
