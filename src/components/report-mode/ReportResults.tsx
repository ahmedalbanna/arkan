
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
 * Parses a single markdown string into a Project object's chapters and sections.
 * @param markdown The markdown string to parse.
 * @param existingProject The existing project to merge IDs from, to maintain stability.
 * @returns A new Project instance with the parsed structure.
 */
function parseMarkdownToProject(markdown: string, existingProject: Project): Project {
    const lines = markdown.split('\n');
    const newChapters: any[] = [];
    let currentChapter: any = null;
    let currentSection: any = null;
    let contentBuffer: string[] = [];

    const flushContent = () => {
        if (contentBuffer.length > 0 && currentSection) {
            currentSection.content = contentBuffer.join('\n').trim();
        }
        contentBuffer = [];
    };

    lines.forEach(line => {
        const h1Match = line.match(/^#\s+(.*)/);
        const h2Match = line.match(/^##\s+(.*)/);

        if (h1Match) {
            flushContent();
            if (currentChapter) {
                if (currentSection) {
                    currentChapter.sections.push(currentSection);
                }
                newChapters.push(currentChapter);
            }
            currentChapter = { title: h1Match[1].trim(), sections: [] };
            currentSection = null;
        } else if (h2Match) {
            flushContent();
            if (currentSection && currentChapter) {
                currentChapter.sections.push(currentSection);
            }
            currentSection = { title: h2Match[1].trim(), content: '' };
        } else {
            contentBuffer.push(line);
        }
    });

    // Flush any remaining content
    flushContent();
    if (currentSection && currentChapter) {
        currentChapter.sections.push(currentSection);
    }
    if (currentChapter) {
        newChapters.push(currentChapter);
    }

    // Reconstruct the project with the new structure, preserving old IDs where possible.
    const finalChapters = newChapters.map((ch, i) => {
      const oldChapter = existingProject.chapters[i];
      const newSections = ch.sections.map((sec: any, j: number) => {
        const oldSection = oldChapter?.sections[j];
        return {
          id: oldSection?.id, // Keep old section ID if possible
          title: sec.title,
          content: sec.content,
          type: 'report'
        };
      });
      return {
        id: oldChapter?.id, // Keep old chapter ID
        title: ch.title,
        sections: newSections
      };
    });

    return existingProject.with({ chapters: finalChapters as any });
}


export function ReportResults() {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  
  const fullMarkdownContent = useMemo(() => {
    if (!project || !project.chapters) return '';
    return project.chapters.map(chapter => {
      const sectionsMarkdown = chapter.sections.map(section => `## ${section.title}\n\n${section.content || ''}`).join('\n\n');
      return `# ${chapter.title}\n\n${sectionsMarkdown}`;
    }).join('\n\n');
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
