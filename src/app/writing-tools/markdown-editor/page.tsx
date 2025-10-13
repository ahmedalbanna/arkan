'use client';

import { AnimatedContainer } from '@/components/ui/animation';
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
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10">
        <main className="container mx-auto py-10">
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 font-headline">Rich Text Editor</h1>
              <p className="text-muted-foreground">A powerful editor for all your writing needs.</p>
            </div>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-in-up" delay={300}>
            <div className="max-w-4xl mx-auto">
              <RichTextEditor content={markdownContent} onChange={() => { }} onAiAction={() => { }} onReadAloud={() => { }} isProcessingAi={false} isReadingAloud={false} />
            </div>
          </AnimatedContainer>
        </main>
      </div>
    </div>
  );
}
