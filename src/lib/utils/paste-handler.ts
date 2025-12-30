
'use client';

import { Editor } from '@tiptap/react';
import { editorPlantUml } from './processPlantUml';
import { marked } from 'marked';

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

export function handleHtmlPaste(editor:Editor, html:string) {
  
  if (html && editor) {
    // If HTML content exists, paste it directly. Tiptap will sanitize it.
    editor.chain().focus().insertContent(html).run();
    return true;
  }
}
export async function handlePlainPaste(editor:Editor, plain:string) {
if (plain && editor) {

  // If PlantUML content is detected, process it.
  if (plain.includes('@startuml') && plain.includes('@enduml')) {
    const processed = await editorPlantUml(plain);
    if (processed) {
      editor.chain().focus().insertContent(marked.parse(processed)).run();
      return true;
    }
  }
  // If only plain text exists, treat it as markdown and parse it.
  const parsedHtml = marked.parse(plain);
  editor.chain().focus().insertContent(parsedHtml).run();
  return true;
}
}
