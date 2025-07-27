
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateAgent } from '@/hooks/use-agents';
import type { Agent, AgentPrompt } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, Bot, BookOpen, Wrench, Terminal, Share2, Library, BotMessageSquare, AlertCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import Link from 'next/link';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AgentEditorProps {
  agentId: string;
  initialData: Agent;
}

const agentPromptSchema = z.object({
  base: z.string().min(10, "Base prompt must be at least 10 characters."),
});

const agentEditorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  prompt: z.union([
    z.string().min(10, "Prompt must be at least 10 characters"),
    agentPromptSchema
  ])
});

type AgentEditorFormValues = z.infer<typeof agentEditorSchema>;

const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={cn(
      'w-full justify-start',
      isActive && 'bg-accent text-accent-foreground'
    )}
  >
    <Icon className="mr-2 h-4 w-4" />
    {label}
  </Button>
);

export default function AgentEditor({ agentId, initialData }: AgentEditorProps) {
  const router = useRouter();
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState('general');
  const [promptLength, setPromptLength] = useState(0);
  
  const updateAgentMutation = useUpdateAgent();

  const form = useForm<AgentEditorFormValues>({
      resolver: zodResolver(agentEditorSchema),
      defaultValues: {
          name: initialData.name,
          prompt: initialData.prompt,
      }
  });

  const promptValue = form.watch('prompt');
  const isComplexPrompt = typeof promptValue === 'object';

  useEffect(() => {
    if (isComplexPrompt) {
      setPromptLength((promptValue as AgentPrompt).base.length);
    } else {
      setPromptLength((promptValue as string).length);
    }
  }, [promptValue, isComplexPrompt]);


  useEffect(() => {
    form.reset({
      name: initialData.name,
      prompt: initialData.prompt,
    });
  }, [initialData, form]);

  const handleSubmit = (data: AgentEditorFormValues) => {
    updateAgentMutation.mutate({ agentId, payload: data }, {
      onSuccess: () => {
        router.push('/admin/manage-agents');
        toast({ title: 'Agent Updated', description: `Agent "${data.name}" has been successfully updated.` });
      }
    });
  };

  const navItems = [
    { id: 'general', label: 'General', icon: Bot },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'share', label: 'Share & Embed', icon: Share2 },
  ];

  const discoverItems = [
    { id: 'templates', label: 'Prompt Templates', icon: Library },
    { id: 'automation', label: 'Automation', icon: BotMessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className='space-y-6'>
            <CardTitle>General</CardTitle>
            <p className="text-sm text-muted-foreground">Select an image or emoji for your agent, serving as a visual identifier for tasks it manages in project backgrounds.</p>
            
            <div>
              <FormLabel>Avatar</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                  <Avatar className='h-16 w-16'>
                      <AvatarImage src="" />
                      <AvatarFallback><Bot className='h-8 w-8' /></AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline">Upload</Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} disabled={updateAgentMutation.isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isComplexPrompt ? (
              <FormField
                control={form.control}
                name="prompt.base"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex justify-between items-center'>
                      <span>Prompt</span>
                      <span className='text-xs text-muted-foreground'>{promptLength}/10000</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={10} className="font-mono text-sm" disabled={updateAgentMutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex justify-between items-center'>
                      <span>Prompt</span>
                      <span className='text-xs text-muted-foreground'>{promptLength}/10000</span>
                    </FormLabel>
                    <FormControl><Textarea {...field} value={field.value as string} rows={10} className="font-mono text-sm" disabled={updateAgentMutation.isPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
      default:
        return <div><CardTitle>{navItems.find(n => n.id === activeTab)?.label || discoverItems.find(d => d.id === activeTab)?.label}</CardTitle><p>Coming soon...</p></div>;
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <div className="space-y-4">
              <div className="space-y-1">
                {navItems.map(item => (
                  <NavItem key={item.id} {...item} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                ))}
              </div>
              <div>
                <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Discover</h3>
                <div className="space-y-1">
                  {discoverItems.map(item => (
                    <NavItem key={item.id} {...item} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="col-span-9">
            <div className="p-6">{renderContent()}</div>
          </div>
        </div>
        <CardFooter className="justify-end gap-2 border-t pt-6 mt-8">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" variant="outline" disabled>Preview</Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Preview is coming soon.</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="submit" disabled={updateAgentMutation.isPending}>
            {updateAgentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </CardFooter>
      </form>
    </FormProvider>
  );
}
