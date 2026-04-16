import { injectable } from "tsyringe";
import type { IWritingToolRegistry, ToolConfig } from "@/modules/ai/domain/services/IWritingToolRegistry";
import { AcademicTools } from "../tool-providers/AcademicToolProvider";
import { WritingTools } from "../tool-providers/WritingToolProvider";
import { GenerationTools } from "../tool-providers/GenerationToolProvider";

@injectable()
export class WritingToolRegistry implements IWritingToolRegistry {
  private readonly toolConfig: Record<string, ToolConfig> = {
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

