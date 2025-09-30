'use client';

import RichTextEditor from '@/components/ui/RichTextEditor';

export default function MarkdownEditorPage() {
  const markdownContent = `# Welcome to the Markdown Editor!

This is a full-featured text editor powered by TipTap. You can use it to write and format your documents with ease.

- Use **bold** and *italic* text.
- Create lists, both ordered and unordered.
- Align your text to the left or right.

\`\`\`javascript
// You can even add code blocks!
console.log("Hello, World!");
\`\`\``;

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4 text-center">Rich Text Editor</h1>
      <p className="text-center text-muted-foreground mb-8">A powerful editor for all your writing needs.</p>
      <div className="max-w-4xl mx-auto">
        <RichTextEditor content={markdownContent} onChange={() => { }} onAiAction={() => { }} onReadAloud={() => { }} isProcessingAi={false} isReadingAloud={false} />
      </div>
    </main>
  );
}
