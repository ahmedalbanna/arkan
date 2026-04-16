export interface PptxStyleOptions {
  background: { color: string };
  title: {
    fontFace: string;
    fontSize: number;
    bold: boolean;
    color: string;
    align: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  };
  body: {
    fontFace: string;
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
    lineSpacing: number;
    valign: 'top' | 'middle' | 'bottom';
  };
  bullet: {
    type: 'bullet' | 'number';
    code?: unknown;
  };
  subtitle: {
    fontFace?: string;
    fontFamily?: string;
    fontSize: number;
    italic: boolean;
    color: string;
  };
  blockquote: {
    fontFace: string;
    fontSize: number;
    color: string;
    italic: boolean;
    indent: number;
    lineSpacing?: number;
    valign?: 'top' | 'middle' | 'bottom';
  };
  table: {
    color: string;
    fontFace: string;
    fontSize: number;
    align: 'left' | 'center' | 'right';
    valign: 'top' | 'middle' | 'bottom';
    border?: { type: 'none' | 'solid' | 'dash'; color: string; pt: number };
  };
  tableHeaderStyle: {
    bold: boolean;
    fill: { color: string };
    color?: string;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    fontFace?: string;
    fontSize?: number;
  };
  tableCellStyle: {
    fontFace?: string;
    fontSize?: number;
    color?: string;
    valign?: 'top' | 'middle' | 'bottom';
    align?: 'left' | 'center' | 'right';
  };
  code: {
    fontFace: string;
    fontSize: number;
    color?: string;
    fill: { color: string };
    margin: number;
    valign?: 'top' | 'middle' | 'bottom';
  };
  link: { color: string; underline: boolean };
  inlineCode: {
    fontFace: string;
    color: string;
    highlight: string;
    fontSize?: number;
  };
  footnote?: {
    fontFace?: string;
    fontSize: number;
    color: string;
    lineColor?: string;
  };
  border: { type: string; pt: number; color: string };
}

