'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgents } from '@/hooks/use-agents';
import type { Agent } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AgentEditor({ agentId }: { agentId: string }) {
  const router = useRouter();
  const { getAgent, updateAgent, isLoaded } = useAgents();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const foundAgent = getAgent(agentId);
      if (foundAgent) {
        setAgent(foundAgent);
        setName(foundAgent.name);
        setPrompt(foundAgent.prompt);
      } else {
        router.push('/manage-agents');
      }
    }
  }, [agentId, getAgent, isLoaded, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateAgent(agentId, { name, prompt });
    
    setTimeout(() => {
        setIsSaving(false);
        toast({
            title: "تم الحفظ بنجاح",
            description: `تم تحديث بيانات الوكيل "${name}".`,
        });
        router.push('/manage-agents');
    }, 500);
  };

  if (!isLoaded || !agent) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <agent.icon className="w-8 h-8 text-primary" />
            <div>
                <CardTitle className="font-headline">{agent.name}</CardTitle>
                <CardDescription>
                    المعرف: {agent.id} | الفئة: {agent.category}
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">اسم الوكيل</Label>
            <Input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-prompt">موجه الأوامر (Prompt)</Label>
            <Textarea
              id="agent-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isSaving} className="font-headline">
            {isSaving ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Save className="ml-2 h-4 w-4" />
            )}
            حفظ التغييرات
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
