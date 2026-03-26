import { PlantUMLGeneratorTool } from "@/modules/ai/adapters/components/writing-tools/PlantUMLGeneratorTool";
import { GitGraph } from "lucide-react";

export default function GenerateDiagramPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <GitGraph className="w-10 h-10" />
          PlantUML Diagram Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate PlantUML diagrams from natural language descriptions.
        </p>
      </div>
      <PlantUMLGeneratorTool />
    </div>
  );
}
