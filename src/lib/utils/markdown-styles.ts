
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

// Helper to check if a node is a paragraph with only text/inline children
const isSimpleParagraph = (node: any) => {
  if (node.type !== 'element' || node.tagName !== 'p') {
    return false;
  }
  return node.children.every((child: any) => child.type === 'text' || (child.type === 'element' && ['a', 'strong', 'em', 'code', 'br'].includes(child.tagName)));
};

export const markdownComponents: { [key: string]: React.ElementType } = {
  h1: ({ node, ...props }) => React.createElement('h1', { className: "mt-6 mb-4 text-3xl font-bold text-primary font-headline", ...props }),
  h2: ({ node, ...props }) => React.createElement('h2', { className: "mt-5 mb-3 text-2xl font-bold text-primary font-headline", ...props }),
  h3: ({ node, ...props }) => React.createElement('h3', { className: "mt-4 mb-2 text-xl font-semibold font-headline", ...props }),
  p: ({ node, ...props }) => {
    // This is the key change to prevent nesting block elements inside <p>
    // `react-markdown` sometimes wraps other block elements in a <p> internally.
    // We check if the first child is a known block-level custom component. If so, we render it directly.
    if (node && node.children.length === 1 && node.children[0].tagName === 'pre') {
      return React.createElement(React.Fragment, props);
    }
    return React.createElement('p', { className: "mb-4 leading-relaxed", ...props });
  },
  a: ({ node, ...props }) => React.createElement('a', { className: "text-accent underline hover:text-accent/80", ...props }),
  ul: ({ node, ...props }) => React.createElement('ul', { className: "mb-4 ml-4 list-disc space-y-2", ...props }),
  ol: ({ node, ...props }) => React.createElement('ol', { className: "mb-4 ml-4 list-decimal space-y-2", ...props }),
  li: ({ node, ...props }) => React.createElement('li', { className: "pl-2", ...props }),
  blockquote: ({ node, ...props }) => React.createElement('blockquote', { className: "my-4 border-l-4 border-primary/20 pl-4 italic text-muted-foreground", ...props }),
  pre: ({ node, ...props }) => React.createElement('pre', { className: cn("my-4 overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm", (props as any).className), ...props }),
  code: ({ node, inline, className, children, ...props }) => {
    // For inline code, just render the <code> tag
    if (inline) {
      return React.createElement(
        'code',
        { className: `rounded bg-muted px-1 py-0.5 font-mono text-sm text-muted-foreground ${className || ''}`.trim(), ...props },
        children
      );
    }
    // For block code, the parent `pre` tag is handled by its own component now.
    // This just renders the `<code>` inside it.
    return React.createElement('code', { className: cn("font-mono text-sm", className), ...props }, children);
  },
  table: ({ node, ...props }) => React.createElement('div', { className: "my-4 w-full overflow-x-auto" }, React.createElement('table', { className: "w-full border-collapse border border-border", ...props })),
  thead: ({ node, ...props }) => React.createElement('thead', { className: "bg-muted", ...props }),
  tbody: ({ node, ...props }) => React.createElement('tbody', { className: "[&_tr:last-child]:border-0", ...props }),
  tr: ({ node, ...props }) => React.createElement('tr', { className: "border-b border-border transition-colors hover:bg-muted/50", ...props }),
  th: ({ node, ...props }) => React.createElement('th', { className: "px-4 py-2 text-left align-middle font-medium text-muted-foreground border border-border", ...props }),
  td: ({ node, ...props }) => React.createElement('td', { className: "px-4 py-2 align-middle border border-border", ...props }),
};
