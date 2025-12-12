import { Editor, Range, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { CommandList } from '@/components/editor/CommandList';
import { CommandItemProps } from './types';
import {
  Heading1, Heading2, Heading3, List, ListOrdered, Table, Quote
} from 'lucide-react';

const commandItems: CommandItemProps[] = [
  { title: 'Heading 1', icon: <Heading1 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() },
  { title: 'Heading 2', icon: <Heading2 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() },
  { title: 'Heading 3', icon: <Heading3 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run() },
  { title: 'Bulleted List', icon: <List size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
  { title: 'Numbered List', icon: <ListOrdered size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
  { title: 'Table', icon: <Table size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Blockquote', icon: <Quote size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
];

const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => {
          return commandItems.filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
        },
        render: () => {
          let component: ReactRenderer<any, any>;
          let popup: any;

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate(props) {
              component.updateProps(props);
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }
              return component.ref?.onKeyDown(props.event);
            },
            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});

export default SlashCommand;
