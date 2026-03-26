import { Editor, Range } from '@tiptap/core';
import React from 'react';

export interface CommandItemProps {
  title: string;
  icon: React.ReactNode;
  command: (props: { editor: Editor; range: Range }) => void;
}
