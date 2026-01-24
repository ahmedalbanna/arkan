// @ts-nocheck

'use client';

import { Editor, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { Code, GitGraph, Heading1, Heading2, Heading3, Image as ImageIcon, List, ListOrdered, ListTree, Quote, Table, Text, Wand2 } from 'lucide-react';
import tippy, { GetReferenceClientRect, Instance } from 'tippy.js';
import CommandList from './CommandList';

const getCommandItems = (editor: Editor) => [
  {
    title: 'Table of Contents', description: 'Generate a TOC from headings.', icon: <ListTree size={20} />, command: () => {
      const headings: { level: number; text: string }[] = [];
      editor.state.doc.forEach(node => {
        if (node.type.name === 'heading') {
          headings.push({
            level: node.attrs.level,
            text: node.textContent,
          });
        }
      });
      const tocMarkdown = headings.map(h => `${'  '.repeat(h.level - 1)}- ${h.text}`).join('\n');
      editor.chain().focus().insertContent(tocMarkdown).run();
    }
  },
  { title: 'Heading 1', description: 'Large section heading.', icon: <Heading1 size={20} />, command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: 'Heading 2', description: 'Medium section heading.', icon: <Heading2 size={20} />, command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: 'Heading 3', description: 'Small section heading.', icon: <Heading3 size={20} />, command: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { title: 'Paragraph', description: 'Plain text.', icon: <Text size={20} />, command: () => editor.chain().focus().setParagraph().run() },
  { title: 'Bulleted List', description: 'A simple bulleted list.', icon: <List size={20} />, command: () => editor.chain().focus().toggleBulletList().run() },
  { title: 'Numbered List', description: 'A list with ordered numbers.', icon: <ListOrdered size={20} />, command: () => editor.chain().focus().toggleOrderedList().run() },
  { title: 'Table', description: 'Insert a 2x2 table.', icon: <Table size={20} />, command: () => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run() },
  {
    title: 'Image', description: 'Insert an image from a URL.', icon: <ImageIcon size={20} />, command: () => {
      const url = window.prompt('Enter image URL');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  },
  {
    title: 'AI Image',
    description: 'Generate an image with AI.',
    icon: <Wand2 size={20} />,
    command: () => {
      editor.chain().focus().insertAIImageGenerator().run();
    }
  },
  { title: 'Blockquote', description: 'A quote block.', icon: <Quote size={20} />, command: () => editor.chain().focus().toggleBlockquote().run() },
  { title: 'Code Block', description: 'A block for code snippets.', icon: <Code size={20} />, command: () => editor.chain().focus().toggleCodeBlock().run() },
  // @ts-expect-error - Custom TipTap extension command
  { title: 'PlantUML Diagram', description: 'Embed a live PlantUML diagram.', icon: <GitGraph size={20} />, command: () => editor.chain().focus().insertPlantUML().run() },
];

const render = () => {
  let component: ReactRenderer<any>;
  let popup: Instance[];

  return {
    onStart: (props: { editor: Editor; clientRect: GetReferenceClientRect }) => {
      const commandItems = getCommandItems(props.editor);
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
      const commandItems = getCommandItems(props.editor);
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
          // This is the fix: chain commands to first delete the trigger, then run the selected command.
          editor.chain().focus().deleteRange(range).run();
          props.command();
        },
        items: ({ query }) => {
          const commandItems = getCommandItems(this.editor);
          return commandItems.filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
        },
        allow: ({ editor, range }) => {
          const $from = editor.state.selection.$from;
          const isAtStart = $from.parentOffset === 0;
          const isAnEmptyLine = !$from.parent.textContent;

          // Allow if it's the beginning of a line and either the line is empty
          // OR the user has just typed the '/' character.
          return isAtStart && (isAnEmptyLine || editor.state.doc.textBetween(range.from, range.to) === '/');
        },
        render: render as any || undefined,
      }),
    ];
  },
});

export default SlashCommand;
