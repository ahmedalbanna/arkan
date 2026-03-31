
import { injectable } from "tsyringe";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { marked } from "marked";
import { IMarkdownService } from "../../domain/services/IMarkdownService";

@injectable()
export class TurndownMarkdownService implements IMarkdownService {
    private turndown: TurndownService;

    constructor() {
        this.turndown = new TurndownService({ 
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });
        this.turndown.use(gfm);
    }

    public toMarkdown(html: string): string {
        return this.turndown.turndown(html);
    }

    public toHtml(markdown: string): string {
        return marked.parse(markdown) as string;
    }
}
