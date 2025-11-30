
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
  
  // FIX: Add a check to ensure file.name is not undefined before splitting.
  if (!file.name) {
    console.warn('File dropped without a name, skipping.');
    return;
  }
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  reader.onload = (event) => {
    const content = event.target?.result;
    if (typeof content === 'string') {
      let html = '';
      if (file.type.startsWith('image/')) {
        html = `<img src="${content}" />`;
      } else if (fileExtension === 'md' || file.type === 'text/markdown') {
        html = marked.parse(content) as string;
      }
      if (html) {
        editor.chain().focus().insertContent(html).run();
      }
    } else if (content instanceof ArrayBuffer) {
      if (fileExtension === 'docx') {
        mammoth.convertToHtml({ arrayBuffer: content })
          .then((result) => {
            editor.chain().focus().insertContent(result.value).run();
          })
          .catch((error) => {
            console.error(error);
            window.alert('Error converting .docx file.');
          });
      }
    }
  };

  reader.onerror = (error) => {
    console.error('Error reading file:', error);
    window.alert('Error reading file.');
  };

  if (file.type.startsWith('image/')) {
    reader.readAsDataURL(file);
  } else if (fileExtension === 'md' || file.type === 'text/markdown') {
    reader.readAsText(file);
  } else if (fileExtension === 'docx') {
    reader.readAsArrayBuffer(file);
  } else {
    console.warn(`Unsupported file type dropped: ${file.type}`);
  }
};
