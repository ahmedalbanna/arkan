
'use client';

import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import {
  Briefcase,
  Calendar,
  FileSpreadsheet,
  FileText,
  Mail,
  MessageCircle,
  Clock,
  Waypoints,
  Type,
  Plus
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AVAILABLE_AUTOMATIONS } from '@/lib/automations';
import { useLocalization } from '@/context/LocalizationContext';

export default function AutomationTab() {
  const { t } = useLocalization();
  return (
    <div className="space-y-6">
      <CardTitle>{t('agentEditor.automationTitle')}</CardTitle>
      <p className="text-sm text-muted-foreground">
        {t('agentEditor.automationDesc')}
      </p>
       <Button variant="outline" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          {t('agentEditor.newAutomationBtn')}
        </Button>
      
      <div className="space-y-2">
        {AVAILABLE_AUTOMATIONS.map((automation, index) => (
            <Button key={index} variant="outline" className="w-full h-auto justify-start text-left">
                <div className="flex items-start gap-4 p-2">
                    <automation.icon className="h-5 w-5 mt-1 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">{automation.service}</p>
                        <p className="text-sm text-muted-foreground font-normal">{automation.description}</p>
                    </div>
                </div>
            </Button>
        ))}
      </div>
    </div>
  );
}
