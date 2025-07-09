
import React from 'react';

export const markdownComponents: { [key: string]: React.ElementType } = {
  h1: ({node, ...props}: any) => React.createElement('h1', { className: "mt-6 mb-4 text-3xl font-bold text-primary font-headline", ...props }),
  h2: ({node, ...props}: any) => React.createElement('h2', { className: "mt-5 mb-3 text-2xl font-bold text-primary font-headline", ...props }),
  h3: ({node, ...props}: any) => React.createElement('h3', { className: "mt-4 mb-2 text-xl font-semibold font-headline", ...props }),
  p: ({node, ...props}: any) => React.createElement('p', { className: "mb-4 leading-relaxed", ...props }),
  a: ({node, ...props}: any) => React.createElement('a', { className: "text-accent underline hover:text-accent/80", ...props }),
  ul: ({node, ...props}: any) => React.createElement('ul', { className: "mb-4 ml-4 list-disc space-y-2", ...props }),
  ol: ({node, ...props}: any) => React.createElement('ol', { className: "mb-4 ml-4 list-decimal space-y-2", ...props }),
  li: ({node, ...props}: any) => React.createElement('li', { className: "pl-2 space-y-2", ...props }),
  blockquote: ({node, ...props}: any) => React.createElement('blockquote', { className: "my-4 border-l-4 border-primary/20 pl-4 italic text-muted-foreground", ...props }),
  code: ({node, inline, className, children, ...props}: any) => {
    if (!inline) {
      return React.createElement(
        'pre', 
        { className: "my-4 overflow-x-auto rounded-md bg-muted p-4" }, 
        React.createElement('code', { className: `font-mono text-sm ${className || ''}`.trim(), ...props }, children)
      );
    }
    return React.createElement(
      'code', 
      { className: `rounded bg-muted px-1 py-0.5 font-mono text-sm text-muted-foreground ${className || ''}`.trim(), ...props }, 
      children
    );
  },
  table: ({node, ...props}: any) => React.createElement('div', { className: "my-4 w-full overflow-x-auto" }, React.createElement('table', { className: "w-full border-collapse border border-border", ...props })),
  thead: ({node, ...props}: any) => React.createElement('thead', { className: "bg-muted", ...props }),
  tbody: ({node, ...props}: any) => React.createElement('tbody', { className: "[&_tr:last-child]:border-0", ...props }),
  tr: ({node, ...props}: any) => React.createElement('tr', { className: "border-b border-border transition-colors hover:bg-muted/50", ...props }),
  th: ({node, ...props}: any) => React.createElement('th', { className: "px-4 py-2 text-left align-middle font-medium text-muted-foreground border border-border", ...props }),
  td: ({node, ...props}: any) => React.createElement('td', { className: "px-4 py-2 align-middle border border-border", ...props }),
};
