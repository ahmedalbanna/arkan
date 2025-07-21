
'use client';

import AgentManager from "@/components/AgentManager";
import { useLocalization } from "@/context/LocalizationContext";
import { Bot } from "lucide-react";

export default function ManageAgentsPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Bot className="w-10 h-10" />
          {t('header.agentManager')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('agentManager.pageSubtitle')}
        </p>
      </div>
      <AgentManager />
    </div>
  );
}
