
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
import { FileText, PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MenuBar } from './MenuBar';
import RichTextEditor from './RichTextEditor';
import { Project } from '@/lib/models';

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

    return existingProject.with({ chapters: finalChapters });
}


export function ReportResults() {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const [newChapterTitle, setNewChapterTitle] = useState('');

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

  function handleCreateFirstChapter() {
    if (!newChapterTitle.trim()) {
        return;
    }
    const markdown = `# ${newChapterTitle.trim()}`;
    handleContentChange(markdown);
    setNewChapterTitle('');
  }

  function renderContent() {
    if (!project?.hasContent()) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-muted-foreground p-8 max-w-md">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              Your Report is Empty
            </h3>
            <p className="text-sm mt-1 mb-6">
             Start by generating a proposal, or create your first chapter to get started.
            </p>
          </div>
        </div>
      );
    }

    if (!project.chapters || project.chapters.length === 0) {
        return (
             <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground p-8 max-w-md">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">
                  No Chapters to Display
                </h3>
                 <p className="text-sm mt-1 mb-6">
                 Create your first chapter to get started. You can also generate a Table of Contents from the tools panel.
                </p>
                <div className="flex w-full max-w-sm mx-auto items-center space-x-2">
                   <Input 
                    value={newChapterTitle} 
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Enter chapter title..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFirstChapter()}
                  />
                  <Button onClick={handleCreateFirstChapter}>
                    <PlusCircle className="me-2 h-4 w-4" /> Create Chapter
                  </Button>
                </div>
              </div>
            </div>
        )
    }

    return (
        <A4Page>
            <RichTextEditor
              key={project.id} // Re-mount editor when project changes
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
