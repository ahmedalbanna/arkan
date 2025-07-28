
'use client';

import { useBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { type BlockNoteEditor } from '@blocknote/core';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

export default function BlockEditor({ onChange, initialContent, editable }: EditorProps) {
  const { resolvedTheme } = useTheme();
  
  // useBlockNote must be called conditionally after mount
  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onEditorContentChange: (editor: BlockNoteEditor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
  });


  if (!editor) {
    return <div className="prose dark:prose-invert max-w-none">Loading Editor...</div>;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}
