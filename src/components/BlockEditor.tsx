
'use client';

import { BlockNoteView, useBlockNote } from "@blocknote/react";
import { BlockNoteEditor } from "@blocknote/core";
import { useTheme } from 'next-themes';
import React from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

export default function BlockEditor({ onChange, initialContent, editable }: EditorProps) {
    const { resolvedTheme } = useTheme();
    
    // Creates a new editor instance.
    const editor: BlockNoteEditor | null = useBlockNote({
        onEditorContentChange: (editor) => {
            onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
        },
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    });

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
}
