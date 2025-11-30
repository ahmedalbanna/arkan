'use client';

import { Editor } from '@tiptap/react';
import mammoth from 'mammoth';
import { marked } from 'marked';

/**
 * Handles dropping a file into the Tiptap editor.
 * It reads the file and inserts its content, converting from Markdown or DOCX if necessary.
 * @param file The file that was dropped.
 * @param editor The Tiptap editor instance.
 */
export const handleFileDrop = (file: File, editor: Editor) => {
  const reader = new FileReader();
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (file.type.startsWith('image/')) {
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    };
    reader.readAsDataURL(file);
  } else if (fileExtension === 'md' || file.type === 'text/markdown') {
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const html = marked.parse(content) as string;
      editor.chain().focus().insertContent(html).run();
    };
    reader.readAsText(file);
  } else if (fileExtension === 'docx') {
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
        .then((result) => {
          editor.chain().focus().insertContent(result.value).run();
        })
        .catch((error) => {
          console.error(error);
          window.alert('Error converting .docx file.');
        });
    };
    reader.readAsArrayBuffer(file);
  } else {
    // For other file types, you might want to show an alert or handle them differently
    console.warn(`Unsupported file type dropped: ${file.type}`);
  }
};
