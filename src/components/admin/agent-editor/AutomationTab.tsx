
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

export default function AutomationTab() {
  return (
    <div className="space-y-6">
      <CardTitle>Automation</CardTitle>
      <p className="text-sm text-muted-foreground">
        Use your AI agent as part of an automation flow to handle tasks, make decisions, and streamline workflows. Build custom workflows and tools to further empower your agents. Your AI agents can seamlessly integrate into automations, transforming how you manage work. <a href="#" className="text-primary underline">Learn more.</a>
      </p>
       <Button variant="outline" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Add new automation
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
