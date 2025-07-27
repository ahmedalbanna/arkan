'use client';

import { BlockNoteView, useBlockNote } from '@blocknote/react';
import { BlockNoteEditor } from '@blocknote/core';
import { useTheme } from 'next-themes';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

export default function BlockEditor({ onChange, initialContent, editable }: EditorProps) {
  const { resolvedTheme } = useTheme();

  const editor: BlockNoteEditor = useBlockNote({
    editable,
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
  });

  return (
    <div className="prose dark:prose-invert max-w-none">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}