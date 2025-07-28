
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
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  // useBlockNote must be called conditionally after mount
  const editorInstance = useBlockNote({
    editable,
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
  });

  useEffect(() => {
    setEditor(editorInstance);
  }, [editorInstance]);


  if (!editor) {
    return <div className="prose dark:prose-invert max-w-none">Loading Editor...</div>;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}
