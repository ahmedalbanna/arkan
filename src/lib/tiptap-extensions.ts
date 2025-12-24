import { handleFileDrop } from '@/lib/utils/drop-handler';
import { handleFilePaste } from '@/lib/utils/paste-handler';
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
import 'katex/dist/katex.min.css';
import Katex from 'tiptap-katex';
import PlantUML from './editor/plantUml-extension'; // Import the new extension
import SlashCommand from './editor/slash-command';

export const editorExtensions = (uniqueId: string) => [
  StarterKit.configure({
    // Future configurations can go here
    codeBlock: { HTMLAttributes: { class: '' }, exitOnArrowDown: true, exitOnTripleEnter: true },
  }),
  Placeholder.configure({
    placeholder: 'Start writing, drag-and-drop files, or type / for commands...',
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  BubbleMenuExtension.configure({
    pluginKey: uniqueId,
  }),
  Image,
  Dropcursor,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Katex.configure({}),
  PlantUML, // Add the PlantUML extension
  FileHandler.configure({
    onDrop: (currentEditor, files) => {
      files.forEach(file => handleFileDrop(currentEditor, file));
      return true;
    },
    onPaste: async (currentEditor, files, htmlContent) => {
      if (htmlContent) {
        // Let the editor handle HTML paste
        return false;
      }


      files.forEach(file => handleFilePaste(currentEditor, file));
      return files.length > 0;
    },
  }),
  SlashCommand,
];
