

import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import Dropcursor from '@tiptap/extension-dropcursor';
import { FileHandler } from '@tiptap/extension-file-handler';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import Katex from 'tiptap-katex';
import PlantUML from './editor/plantUml-extension'; // Import the new extension
import SlashCommand from './editor/slash-command';
import { marked } from 'marked';
import mammoth from 'mammoth';
import { editorPlantUml } from './utils/processPlantUml';
import AIImageGeneratorNode from './editor/ai-image-generator-extension';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';

/**
 * Handles dropping a file into the Tiptap editor.
 * It reads the file and inserts its content, converting from Markdown or DOCX if necessary.
 * @param file The file that was dropped.
 * @param editor The Tiptap editor instance.
 */
export const handleFileDrop = (editor: Editor, file: File) => {
  if (!file || !file.name) {
    console.warn('File dropped without a name or content, skipping.');
    return;
  }
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const reader = new FileReader();

  reader.onload = (event) => {
    const content = event.target?.result;
    if (typeof content === 'string') {
      if (file.type.startsWith('image/')) {
        editor.chain().focus().setImage({ src: content }).run();
      } else if (fileExtension === 'md' || file.type === 'text/markdown') {
        const html = marked.parse(content) as string;
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

export async function handleHtmlPaste(editor:Editor, html:string) {
  if (html && editor) {
    editor.chain().focus().insertContent(html, {
        parseOptions: {
            preserveWhitespace: false,
        },
    }).run();
    return true;
  }
  return false;
}

export async function handlePlainPaste(editor:Editor, plain:string) {
  if (plain && editor) {
    if (plain.includes('@startuml') && plain.includes('@enduml')) {
        const processed = await editorPlantUml(plain);
        if (processed) {
            editor.chain().focus().insertContent(marked.parse(processed) as string).run();
            return true;
        }
    }
    const parsedHtml = marked.parse(plain) as string;
    editor.chain().focus().insertContent(parsedHtml).run();
    return true;
  }
  return false;
}


export const editorExtensions = (uniqueId: string) => [
  StarterKit.configure({
    codeBlock: { HTMLAttributes: { class: '' }, exitOnArrowDown: true, exitOnTripleEnter: true },
  }),
  TextStyle,
  Color,
  Placeholder.configure({
    placeholder: 'Start writing, drag-and-drop files, or type / for commands...',
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  BubbleMenuExtension.configure({
    pluginKey: uniqueId,
  }),
  Image.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: 'tiptap-image',
    },

  }),
  Dropcursor,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Katex.configure({}),
  PlantUML,
  AIImageGeneratorNode,
  FileHandler.configure({
    onDrop: (currentEditor, files) => {
      files.forEach(file => handleFileDrop(currentEditor, file));
      return true;
    },
    onPaste: async (currentEditor, files, htmlContent) => {
      if (htmlContent) {
        // If HTML content is present, let Tiptap handle it or use a custom HTML handler
        return false;
      }
      files.forEach(file => handleFilePaste(currentEditor, file));
      return files.length > 0;
    },
  }),
  SlashCommand,
];
