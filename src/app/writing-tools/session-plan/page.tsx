import { SessionPlanGenerator } from "@/modules/ai/adapters/components/writing-tools/SessionPlanGenerator";
import { PlaneIcon } from "lucide-react";

export default function SessionPlanGeneratorPage() {
  return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
          <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                  <PlaneIcon className="w-10 h-10" />
                  Session Plan Generator
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                  Generate comprehensive and engaging session plans from your content.

              </p>
          </div>
      <SessionPlanGenerator />
    </div>
  );
}
