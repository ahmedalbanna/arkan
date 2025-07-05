import AgentManager from "@/components/AgentManager";
import { Bot } from "lucide-react";

export default function ManageAgentsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Bot className="w-10 h-10" />
          إدارة وكلاء الذكاء الاصطناعي
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          تحكم في وكلاء الذكاء الاصطناعي المتاحين في المنصة وقم بتفعيل أو تعطيل وظائفهم.
        </p>
      </div>
      <AgentManager />
    </div>
  );
}
