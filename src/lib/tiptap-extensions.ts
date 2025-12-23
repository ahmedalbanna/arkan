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
import Katex from 'tiptap-katex';
import { handleFileDrop } from '@/lib/utils/drop-handler';
import { handleFilePaste } from '@/lib/utils/paste-handler';
import 'katex/dist/katex.min.css';
import SlashCommand from './editor/slash-command';
import PlantUML from './editor/plantUml-extension'; // Import the new extension

export const editorExtensions = (uniqueId: string) => [
  StarterKit.configure({
    // Future configurations can go here
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
    onPaste: (currentEditor, files, htmlContent) => {
      if (htmlContent) return false;
      files.forEach(file => handleFilePaste(currentEditor, file));
      return true;
    },
  }),
  SlashCommand,
];
