
'use client';

import { cn } from '@/lib/utils/cn';
import React from 'react';

// Helper to check if a node is a paragraph with only text/inline children
const _isSimpleParagraph = (_node: any) => {
  // Placeholder function kept for future use
  return true;
};

export const markdownComponents: { [key: string]: React.ElementType } = {
  h1: ({ _node, ...props }) => React.createElement('h1', { className: "mt-8 mb-4 text-3xl font-bold font-headline text-primary", ...props }),
  h2: ({ _node, ...props }) => React.createElement('h2', { className: "mt-6 mb-3 text-2xl font-bold font-headline border-b pb-2", ...props }),
  h3: ({ _node, ...props }) => React.createElement('h3', { className: "mt-6 mb-3 text-xl font-semibold font-headline", ...props }),
  p: ({ node, ...props }) => {
    // This is the key change to prevent nesting block elements inside <p>
    // `react-markdown` sometimes wraps other block elements in a <p> internally.
    // We check if the first child is a known block-level custom component. If so, we render it directly.
    if (node && node.children.length === 1 && ['pre', 'table', 'blockquote'].includes(node.children[0].tagName)) {
      return React.createElement(React.Fragment, props, props.children);
    }
    return React.createElement('p', { className: "mb-4 leading-relaxed", ...props });
  },
  a: ({ _node, ...props }) => React.createElement('a', { className: "text-primary underline hover:text-primary/80", ...props }),
  ul: ({ _node, ...props }) => React.createElement('ul', { className: "mb-4 ml-6 list-disc space-y-2", ...props }),
  ol: ({ _node, ...props }) => React.createElement('ol', { className: "mb-4 ml-6 list-decimal space-y-2", ...props }),
  li: ({ _node, ...props }) => React.createElement('li', { className: "pl-2", ...props }),
  blockquote: ({ _node, ...props }) => React.createElement('blockquote', { className: "my-4 border-l-4 border-primary/30 bg-muted/50 p-4 italic text-muted-foreground", ...props }),
  pre: ({ _node, ...props }) => React.createElement('pre', { className: cn("my-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm", (props as any).className), ...props }),
  code: ({ _node, inline, className, children, ...props }) => {
    // For inline code, just render the <code> tag
    if (inline) {
      return React.createElement(
        'code',
        { className: `rounded bg-muted px-1.5 py-1 font-mono text-sm text-primary/80 ${className || ''}`.trim(), ...props },
        children
      );
    }
    // For block code, the parent `pre` tag is handled by its own component now.
    // This just renders the `<code>` inside it.
    return React.createElement('code', { className: cn("font-mono text-sm text-current", className), ...props }, children);
  },
  table: ({ _node, ...props }) => React.createElement('div', { className: "my-6 w-full overflow-x-auto" }, React.createElement('table', { className: "w-full border-collapse", ...props })),
  thead: ({ _node, ...props }) => React.createElement('thead', { className: "bg-muted", ...props }),
  tbody: ({ _node, ...props }) => React.createElement('tbody', { className: "[&_tr:last-child]:border-0", ...props }),
  tr: ({ _node, ...props }) => React.createElement('tr', { className: "border-b border-border transition-colors hover:bg-muted/50", ...props }),
  th: ({ _node, ...props }) => React.createElement('th', { className: "px-4 py-3 text-left align-middle font-semibold text-foreground border border-border", ...props }),
  td: ({ _node, ...props }) => React.createElement('td', { className: "px-4 py-3 align-middle border border-border", ...props }),
};
