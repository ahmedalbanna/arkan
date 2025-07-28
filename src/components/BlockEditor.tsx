'use client';

import React from 'react';
import { type BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useTheme } from 'next-themes';

interface BlockEditorProps {
  editor: BlockNoteEditor;
  editable: boolean;
}

const EditorView = ({ editor, editable }: BlockEditorProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
};

export default React.memo(EditorView);
