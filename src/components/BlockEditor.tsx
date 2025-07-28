
'use client';

import { useBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { type BlockNoteEditor } from '@blocknote/core';
import { useTheme } from 'next-themes';
import React, { useMemo } from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

// Our <Editor> component we can use with Next.js
const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();

  const editor: BlockNoteEditor | null = useBlockNote(
    {
      onEditorContentChange: (editor) => {
        onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
      },
      initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    },
    [initialContent]
  );

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  // Renders the editor instance using a React component.
  return (
    <div className="prose dark:prose-invert max-w-none">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};

export default Editor;
