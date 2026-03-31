
export interface IMarkdownService {
    /**
     * Converts HTML string to Markdown string.
     */
    toMarkdown(html: string): string;

    /**
     * Converts Markdown string to HTML string.
     */
    toHtml(markdown: string): string;
}
