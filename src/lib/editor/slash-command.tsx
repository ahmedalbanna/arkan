import React from 'react';
import { Editor, Range, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { GetReferenceClientRect, Instance } from 'tippy.js';
import { Heading1, Heading2, Heading3, Text, List, ListOrdered, Table, Image as ImageIcon, Code, Quote, GitGraph } from 'lucide-react';
import CommandList from '@/components/editor/CommandList';

const commandItems = [
  { title: 'Heading 1', description: 'Large section heading.', icon: <Heading1 size={20} />, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: 'Heading 2', description: 'Medium section heading.', icon: <Heading2 size={20} />, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: 'Heading 3', description: 'Small section heading.', icon: <Heading3 size={20} />, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { title: 'Paragraph', description: 'Plain text.', icon: <Text size={20} />, command: (editor: Editor) => editor.chain().focus().setParagraph().run() },
  { title: 'Bulleted List', description: 'A simple bulleted list.', icon: <List size={20} />, command: (editor: Editor) => editor.chain().focus().toggleBulletList().run() },
  { title: 'Numbered List', description: 'A list with ordered numbers.', icon: <ListOrdered size={20} />, command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run() },
  { title: 'Table', description: 'Insert a 2x2 table.', icon: <Table size={20} />, command: (editor: Editor) => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run() },
  { title: 'Blockquote', description: 'A quote block.', icon: <Quote size={20} />, command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run() },
  { title: 'Code Block', description: 'A block for code snippets.', icon: <Code size={20} />, command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run() },
  { title: 'PlantUML Diagram', description: 'Embed a live PlantUML diagram.', icon: <GitGraph size={20} />, command: (editor: Editor) => editor.chain().focus().insertPlantUML().run() },
];

const render = () => {
  let component: ReactRenderer<any>;
  let popup: Instance[];

  return {
    onStart: (props: { editor: Editor; clientRect: GetReferenceClientRect }) => {
      component = new ReactRenderer(CommandList, {
        props: { ...props, items: commandItems, command: (item: any) => item.command(props.editor) },
        editor: props.editor,
      });

      if (!props.clientRect) return;

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
    onUpdate(props: { editor: Editor; clientRect: GetReferenceClientRect }) {
      component.updateProps({ ...props, items: commandItems, command: (item: any) => item.command(props.editor) });
      if (!props.clientRect) return;
      popup[0].setProps({ getReferenceClientRect: props.clientRect });
    },
    onKeyDown(props: { event: KeyboardEvent }) {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return (component.ref as any)?.onKeyDown(props);
    },
    onExit() {
      popup[0].destroy();
      component.destroy();
    },
  };
};

const SlashCommand = Extension.create<Partial<SuggestionOptions>>({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          props.command(editor, range);
        },
        items: ({ query }) => {
          return commandItems.filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
        },
        allow: ({ editor, range }) => editor.can().deleteRange(range),
        render: render,
      }),
    ];
  },
});

export default SlashCommand;
