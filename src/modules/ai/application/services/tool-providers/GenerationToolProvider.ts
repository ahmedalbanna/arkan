import type { ToolConfig } from "@/modules/ai/domain/services/IWritingToolRegistry";

// Legacy shim kept for backward compatibility with imports from
// application/services. Runtime registry composition is owned by
// infrastructure/services/WritingToolRegistry.
export const GenerationTools: Record<string, ToolConfig> = {
    // Intentionally empty.
};
