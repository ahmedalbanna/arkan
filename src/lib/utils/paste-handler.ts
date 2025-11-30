
'use client';

import { Editor } from '@tiptap/react';

/**
 * Handles pasting an image file into the Tiptap editor.
 * It reads the file as a data URI and inserts it as an image.
 * @param editor The Tiptap editor instance.
 * @param file The image file that was pasted.
 */
export const handleFilePaste = (editor: Editor, file: File) => {
  if (!file.type.startsWith('image/')) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    if (src) {
      editor.chain().focus().setImage({ src }).run();
    }
  };
  reader.readAsDataURL(file);
};
