
'use client';

import React, { useEffect, useMemo } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useTheme } from 'next-themes';

interface BlockEditorProps {
  initialContent?: string;
  onChange: (value: string) => void;
  editable: boolean;
}

export default function BlockEditor({
  initialContent,
  onChange,
  editable,
}: BlockEditorProps) {
  const { resolvedTheme } = useTheme();

  const editor = useMemo(() => {
    if (!initialContent) {
      return new BlockNoteEditor({ editable });
    }
    const blocks = JSON.parse(initialContent);
    return new BlockNoteEditor({ initialContent: blocks, editable });
  }, [initialContent, editable]);

  const onEditorContentChange = (editor: BlockNoteEditor) => {
    onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
  };

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => onEditorContentChange(editor)}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
}
