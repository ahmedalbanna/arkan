
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
export const handleFileDrop = (editor: Editor, file: File) => {
  const reader = new FileReader();

  if (!file || !file.name) {
    console.warn('File dropped without a name or content, skipping.');
    return;
  }
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  reader.onload = (event) => {
    const content = event.target?.result;
    if (typeof content === 'string') {
      // This branch handles text files (md) and images (read as data URI)
      if (file.type.startsWith('image/')) {
        // For images, use the editor's setImage command
        editor.chain().focus().setImage({ src: content }).run();
      } else if (fileExtension === 'md' || file.type === 'text/markdown') {
        const html = marked.parse(content) as string;
        editor.chain().focus().insertContent(html).run();
      }
    } else if (content instanceof ArrayBuffer) {
      // This branch handles docx files
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
  
  // Decide how to read the file based on its type
  if (file.type.startsWith('image/')) {
    reader.readAsDataURL(file); // For images
  } else if (fileExtension === 'md' || file.type === 'text/markdown') {
    reader.readAsText(file); // For markdown
  } else if (fileExtension === 'docx') {
    reader.readAsArrayBuffer(file); // For docx
  } else {
    console.warn(`Unsupported file type dropped: ${file.type}`);
  }
};
