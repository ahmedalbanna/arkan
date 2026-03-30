if (typeof window !== 'undefined') {
    throw new Error('WritingToolRegistry cannot be imported in the browser. It depends on server-only Genkit infrastructure.');
}

import { injectable } from "tsyringe";
import { AcademicTools } from "./tool-providers/AcademicToolProvider";
import { WritingTools } from "./tool-providers/WritingToolProvider";
import { GenerationTools } from "./tool-providers/GenerationToolProvider";

export interface ToolConfig {
    flow: any;
    schema: any;
    creditCost: number;
    isFreeForGuests?: boolean;
}

@injectable()
export class WritingToolRegistry {
    private toolConfig: Record<string, ToolConfig> = {
        ...AcademicTools,
        ...WritingTools,
        ...GenerationTools,
    };

    getTool(name: string): ToolConfig | undefined {
        return this.toolConfig[name];
    }

    getAllTools(): string[] {
        return Object.keys(this.toolConfig);
    }
}
