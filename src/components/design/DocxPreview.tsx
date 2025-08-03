
'use client';

import { useDocxStyles } from "@/hooks/use-docx-styles";
import { ScrollArea } from "../ui/scroll-area";
import React from 'react';

export function DocxPreview() {
  const { activeStyles } = useDocxStyles();

  if (!activeStyles) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">Select a template to see the preview.</p>
      </div>
    );
  }

  const docStyles = activeStyles.default?.document?.run || {};
  const h1Styles = activeStyles.default?.heading1?.run || {};
  const h2Styles = activeStyles.default?.heading2?.run || {};
  const h3Styles = activeStyles.default?.heading3?.run || {};

  const inlineDocStyles = {
    fontFamily: docStyles.font?.name || 'Calibri',
    fontSize: `${(docStyles.size || 22) / 2}pt`,
    color: `#${docStyles.color || '333333'}`,
    lineHeight: 1.5,
  };

  const createHeadingStyles = (styles: any) => ({
      fontFamily: styles.font?.name || 'Calibri Light',
      fontSize: `${(styles.size || 22) / 2}pt`,
      color: `#${styles.color || '2E74B5'}`,
      fontWeight: styles.bold ? 'bold' : 'normal' as 'bold' | 'normal',
  });

  return (
    <ScrollArea className="h-full bg-muted">
      <div className="p-8 md:p-16">
        <div className="bg-background shadow-lg p-12 mx-auto max-w-3xl" style={{ minHeight: '11in' }}>
          <div style={inlineDocStyles}>
            <h1 style={createHeadingStyles(h1Styles)} className="mb-4 pb-2 border-b">
              The Art of Document Styling
            </h1>
            <p className="mb-4">
              This document serves as a live preview for the styles you configure in the Design Studio. As you adjust fonts, colors, and sizes, you will see your changes reflected here in real-time. This allows you to perfect the appearance of your exported documents before you even generate them.
            </p>
            <h2 style={createHeadingStyles(h2Styles)} className="mb-3 mt-6">
              Heading Level 2 for Subsections
            </h2>
            <p className="mb-4">
              Styling for various heading levels can be managed independently. This ensures a clear and professional hierarchy in your final output. Notice how this heading differs from the main title, creating a visual structure that is easy for readers to follow.
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Easily manage font families and sizes.</li>
              <li>Select colors that match your brand identity.</li>
              <li>Ensure consistency across all your exported reports and proposals.</li>
            </ul>
            <h3 style={createHeadingStyles(h3Styles)} className="mb-2 mt-4">
              Further Customization with Heading 3
            </h3>
            <p>
              Even third-level headings have their own distinct style, providing another layer of organization for more complex documents.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
