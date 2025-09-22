'use client';

import RichTextEditor from '@/components/ui/RichTextEditor';

export default function Home() {
  const markdownContent = `
# مرحبًا من الماركدون!

هذا النص تم تحويله من **ماركدون** إلى HTML وعرضه بواسطة TipTap.

- قائمة أولى
- قائمة ثانية

javascript
  // وهذا مثال على كود
  console.log("Hello, Markdown!");

  `;

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4 text-center">محرر النصوص الغني - TipTap</h1>
      <RichTextEditor content={markdownContent} />
    </main>
  );
}
