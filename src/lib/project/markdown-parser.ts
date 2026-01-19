import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { type Root as MdastRoot, type RootContent } from 'mdast';
import { Chapter, Section, type ProjectContent } from '@/lib/models';
import { getNodeText } from '@/lib/pptx-convert/ast-utils';

/**
 * Parses a markdown string and converts it into a structured array of Chapter and Section objects.
 * This function is now more intelligent, handling hierarchy and preserving existing IDs and properties.
 *
 * @param markdown The raw markdown string to parse.
 * @param existingContent The current project content to preserve IDs and properties.
 * @param isToc Only parse structure (headings, lists), ignore other content.
 * @returns An array of Chapter and Section objects.
 */
export function parseMarkdownToContent(markdown: string, existingContent: ProjectContent, isToc: boolean = false): ProjectContent {
  const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown) as MdastRoot;
  const newContent: (Chapter | Section)[] = [];
  let currentChapter: Chapter | null = null;
  let currentSection: Section | null = null;
  let accumulatedContent: RootContent[] = [];
  const usedIds = new Set<string>(); // Keep track of used IDs to avoid duplicates

  const findExistingItem = <T extends Chapter | Section>(title: string, collection: ProjectContent, constructor: { new(props: any): T }): T | undefined => {
    for (const item of collection) {
        if (item instanceof constructor && item.title === title && !usedIds.has(item.id)) {
            return item as T;
        }
        if (item instanceof Chapter) {
            const foundInSection = item.sections.find(s => s.title === title && !usedIds.has(s.id));
            if (foundInSection && constructor === Section) {
                return foundInSection as T;
            }
        }
    }
    return undefined;
  };

  const flushSection = () => {
    if (currentSection) {
      const sectionMarkdown = isToc ? (currentSection.content || '') : unified().use(remarkGfm).use(remarkStringify).stringify({ type: 'root', children: accumulatedContent }).trim();
      
      currentSection = currentSection.with({ content: sectionMarkdown });

      if (currentChapter) {
        // addSection is immutable and returns a new Chapter instance
        currentChapter = currentChapter.addSection(currentSection);
      } else {
        newContent.push(currentSection);
      }
    }
    accumulatedContent = [];
  };

  const flushChapter = () => {
    flushSection();
    if (currentChapter) {
      newContent.push(currentChapter);
    }
    currentChapter = null;
  };

  // Process all nodes in the AST
  for (const node of ast.children) {
    if (node.type === 'heading') {
      const title = getNodeText(node).trim();
      if (node.depth === 1) { // Chapter
        flushChapter();
        const existingChapter = findExistingItem(title, existingContent, Chapter);
        currentChapter = new Chapter({ 
          id: existingChapter?.id, 
          title: title, 
          sections: [] // CRITICAL FIX: Always start with empty sections
        });
        if (existingChapter) usedIds.add(existingChapter.id);
        currentSection = null; // Reset section when a new chapter starts
      } else { // Section
        flushSection();
        const existingSection = findExistingItem(title, existingContent, Section);
        currentSection = new Section({
            id: existingSection?.id,
            title: title,
            type: existingSection?.type || 'report',
            content: existingSection?.content,
            controls: existingSection?.controls,
            prompt: existingSection?.prompt,
            rules: existingSection?.rules ? [...existingSection.rules] : [],
            guidelines: existingSection?.guidelines ? [...existingSection.guidelines] : [],
            constraints: existingSection?.constraints ? [...existingSection.constraints] : [],
            behaviors: existingSection?.behaviors ? [...existingSection.behaviors] : [],
            context: existingSection?.context,
        });
        if (existingSection) usedIds.add(existingSection.id);
      }
    } else if (node.type === 'list' && currentChapter && isToc) {
        for (const listItem of node.children) {
            if (listItem.type === 'listItem') {
                const sectionTitle = getNodeText(listItem).trim();
                if (sectionTitle) {
                    flushSection();
                    const existingSection = findExistingItem(sectionTitle, existingContent, Section);
                    currentSection = new Section({
                        id: existingSection?.id,
                        title: sectionTitle,
                        type: 'report',
                        // Carry over other properties from existing if needed
                    });
                    if (existingSection) usedIds.add(existingSection.id);
                    flushSection();
                    currentSection = null;
                }
            }
        }
    } else {
      if (currentSection) {
        accumulatedContent.push(node);
      }
    }
  }

  flushChapter();

  return newContent;
}
