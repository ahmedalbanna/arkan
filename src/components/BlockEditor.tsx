
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

// Wrapper component that ensures hooks are only called on the client
const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
    const { resolvedTheme } = useTheme();

    const editor: BlockNoteEditor | null = useBlockNote({
        onEditorContentChange: (editor: BlockNoteEditor) => {
            onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
        },
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
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


export default function BlockEditor(props: EditorProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Render a placeholder on the server and initial client render
    if (!isMounted) {
        return <div className="prose dark:prose-invert max-w-none">Loading Editor...</div>;
    }
    
    // Render the actual editor only on the client
    return <Editor {...props} />;
}
