
This document explains the functionality of the DOCX exporting system, primarily defined in `src/lib/docx-exporter.ts` and `src/lib/docx-styles.ts`.

## 1. Purpose

-   These files provide the capability to convert the application's structured content (project proposals, reports, diagrams) into professionally formatted Microsoft Word (`.docx`) documents.
-   The system is designed to be template-driven, allowing administrators to customize the visual style of the exported documents.

## 2. Key Files

-   **`src/lib/docx-styles.ts`**: This file defines the default styling templates (e.g., 'Modern', 'Classic', 'Academic'). Each template is a configuration object that specifies fonts, colors, sizes, and spacing for various document elements like headings and paragraphs. It is the blueprint for how a DOCX file will look.
-   **`src/lib/docx-exporter.ts`**: This file contains the core logic for the conversion.

## 3. Core Logic in `docx-exporter.ts`

-   **Markdown to DOCX Conversion (`createDocxParagraphs`)**: This is the most critical function. It takes a markdown string as input and converts it into an array of `docx` objects (like `Paragraph`, `Table`, `TextRun`). It uses the `unified` and `remark` libraries to parse the markdown into an Abstract Syntax Tree (AST), then walks through the tree to construct the corresponding `docx` elements, preserving formatting like headings, lists, bold, and italics.
-   **Image Handling (`getProxiedImageBuffer`)**: To embed externally hosted images (like PlantUML diagrams) into the DOCX file, this function fetches the image via the application's own image proxy (`/api/proxy-image`) to avoid CORS issues.
-   **Export Functions (`exportProposalAsDocx`, `exportReportAsDocx`)**: These are the high-level functions called by the UI. They take the application's state (the proposal object, report sections, etc.), assemble the document structure using the `docx` library, apply the selected style template, and trigger a file download in the user's browser using `file-saver`.

This system provides a powerful and flexible way for users to take their AI-generated content offline in a standard, editable format.
