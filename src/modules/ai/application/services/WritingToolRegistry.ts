import { injectable } from "tsyringe";
import { AcademicTools } from "./tool-providers/AcademicToolProvider";
import { WritingTools } from "./tool-providers/WritingToolProvider";
import { GenerationTools } from "./tool-providers/GenerationToolProvider";
import type { ToolConfig } from "../../domain/services/IWritingToolRegistry";

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
