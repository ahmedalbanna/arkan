'use client';

import { cn } from '@/infrastructure/utils/cn';
import React from 'react';

/**
 * Standardized Prose Configuration
 * Centralized styles for both Editor (Tiptap) and Viewer (ReactMarkdown)
 * Optimized for desktop readability
 */
export const PROSE_CLASSES = cn(
  // Base prose styles
  'prose dark:prose-invert max-w-none focus:outline-none',
  'selection:bg-primary/20 transition-all duration-300',

  // Desktop-specific typography
  'text-[16px] lg:text-[17px] xl:text-[18px]',
  'leading-[1.75] lg:leading-[1.8]',

  // Font family with system font stack for performance
  'font-serif',

  // Paragraph spacing
  'prose-p:mb-6 prose-p:mt-0 prose-p:leading-relaxed',

  // Headings with better desktop hierarchy
  'prose-headings:font-black prose-headings:tracking-tight',
  'prose-headings:text-foreground prose-headings:scroll-mt-20',
  'prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0',
  'prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:font-black prose-h1:tracking-tighter prose-h1:mb-6',
  'prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:font-black prose-h2:border-b prose-h2:border-primary/10 prose-h2:pb-2 prose-h2:mb-5',
  'prose-h3:text-xl lg:prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-6',
  'prose-h4:text-lg lg:prose-h4:text-xl prose-h4:font-bold prose-h4:text-primary/80',

  // Text emphasis
  'prose-strong:text-foreground prose-strong:font-black prose-strong:font-serif',
  'prose-em:italic prose-em:text-primary/80',
  'prose-del:text-muted-foreground/60 prose-del:line-through',

  // Blockquotes - more elegant on desktop
  'prose-blockquote:border-l-4 prose-blockquote:border-primary/40',
  'prose-blockquote:bg-primary/[0.02] prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-2',
  'prose-blockquote:rounded-r-xl prose-blockquote:not-italic',
  'prose-blockquote:text-muted-foreground/80 prose-blockquote:text-[0.95em]',
  'prose-blockquote:my-6',

  // Links with better hover states
  'prose-a:text-primary hover:prose-a:text-primary/80',
  'prose-a:underline prose-a:underline-offset-4 hover:prose-a:no-underline',
  'prose-a:transition-colors prose-a:duration-200',

  // Images with desktop-friendly styling
  'prose-img:rounded-2xl prose-img:shadow-xl',
  'prose-img:my-8 prose-img:mx-auto prose-img:block',
  'hover:prose-img:shadow-2xl prose-img:transition-shadow prose-img:duration-300',

  // Lists - better spacing for desktop
  'prose-ul:my-6 prose-ul:space-y-2',
  'prose-ol:my-6 prose-ol:space-y-2',
  'prose-li:my-1 prose-li:pl-2',
  'prose-li:marker:text-primary/60',

  // Code blocks - optimized for readability
  'prose-pre:bg-muted prose-pre:rounded-xl',
  'prose-pre:p-5 prose-pre:my-6',
  'prose-pre:overflow-x-auto prose-pre:shadow-inner',
  'prose-pre:border prose-pre:border-primary/10',
  'prose-code:font-mono prose-code:text-sm',
  'prose-code:bg-muted prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5',
  'prose-code:text-primary/80 prose-code:font-medium',
  'prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-current',

  // Horizontal rule
  'prose-hr:my-12 prose-hr:border-t prose-hr:border-primary/10',

  // Tables - desktop optimized
  'prose-table:w-full prose-table:border-collapse prose-table:my-8',
  'prose-table:shadow-sm prose-table:rounded-xl prose-table:overflow-hidden',
  'prose-th:border prose-th:border-border/60 prose-th:p-4',
  'prose-th:bg-muted/30 prose-th:text-left prose-th:font-black',
  'prose-th:text-[11px] prose-th:uppercase prose-th:tracking-widest',
  'prose-td:border prose-td:border-border/60 prose-td:p-4 prose-td:align-top',
  'prose-tr:hover:bg-muted/20 prose-tr:transition-colors',

  // Keyboard shortcuts
  'kbd:px-2 kbd:py-1 kbd:bg-muted kbd:rounded-md kbd:text-[10px] kbd:font-mono',
  'kbd:border kbd:border-primary/10 kbd:shadow-sm',

  // Desktop-specific enhancements
  '@media (min-width: 1024px)', {
  'prose-p:leading-relaxed': {},
  'prose-pre:text-sm': {},
}
);

/**
 * Editor-specific styles (additional for Tiptap)
 */
export const EDITOR_CLASSES = cn(
  PROSE_CLASSES,
  // Editor-specific cursor and selection
  'caret-primary cursor-text',
  'focus-visible:outline-none',
  // Better selection highlighting
  '::selection:bg-primary/20 ::selection:text-foreground',
  // Placeholder styling
  'is-empty:before:text-muted-foreground/30 is-empty:before:content-[attr(data-placeholder)]',
  'is-empty:before:pointer-events-none is-empty:before:absolute is-empty:before:top-0 is-empty:before:left-0',
  // Focus ring for accessibility
  'focus-within:ring-1 focus-within:ring-primary/20 focus-within:rounded-lg',
);

/**
 * ReactMarkdown component overrides
 * Simplified to rely on PROSE_CLASSES for styling
 */
export const markdownComponents: { [key: string]: React.ElementType } = {
  h1: ({ node, ...props }) => React.createElement('h1', props),
  h2: ({ node, ...props }) => React.createElement('h2', props),
  h3: ({ node, ...props }) => React.createElement('h3', props),
  h4: ({ node, ...props }) => React.createElement('h4', props),
  p: ({ node, ...props }) => {
    // Prevent ReactMarkdown from wrapping nested block elements in <p>
    if (node && node.children.length === 1 && ['pre', 'table', 'blockquote', 'div'].includes(node.children[0].tagName)) {
      return React.createElement(React.Fragment, props, props.children);
    }
    return React.createElement('p', props);
  },
  a: ({ node, ...props }) => React.createElement('a', { target: '_blank', rel: 'noopener noreferrer', ...props }),
  ul: ({ node, ...props }) => React.createElement('ul', { className: "list-disc pl-6 space-y-1", ...props }),
  ol: ({ node, ...props }) => React.createElement('ol', { className: "list-decimal pl-6 space-y-1", ...props }),
  li: ({ node, ...props }) => React.createElement('li', { className: "pl-1", ...props }),
  blockquote: ({ node, ...props }) => React.createElement('blockquote', props),
  pre: ({ node, ...props }) => React.createElement('pre', {
    className: cn("overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm shadow-inner", (props as any).className),
    ...props
  }),
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return React.createElement(
        'code',
        {
          className: cn("rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[0.9em] text-primary/80", className),
          ...props
        },
        children
      );
    }
    return React.createElement('code', {
      className: cn("font-mono text-sm text-current", className),
      ...props
    }, children);
  },
  hr: ({ node, ...props }) => React.createElement('hr', { className: "my-12 border-t border-primary/10", ...props }),
  table: ({ node, ...props }) => React.createElement('div', { className: "w-full overflow-x-auto my-8 rounded-xl border border-primary/10" },
    React.createElement('table', { className: "w-full", ...props })
  ),
  thead: ({ node, ...props }) => React.createElement('thead', props),
  tbody: ({ node, ...props }) => React.createElement('tbody', props),
  tr: ({ node, ...props }) => React.createElement('tr', { className: "border-b border-border transition-colors hover:bg-muted/30", ...props }),
  th: ({ node, ...props }) => React.createElement('th', { className: "p-4 text-left font-black text-[11px] uppercase tracking-widest bg-muted/20", ...props }),
  td: ({ node, ...props }) => React.createElement('td', { className: "p-4 align-top", ...props }),
  img: ({ node, ...props }) => React.createElement('img', {
    className: "max-w-full h-auto rounded-2xl shadow-lg my-8 mx-auto block",
    loading: "lazy",
    ...props
  }),
};
