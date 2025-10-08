
'use client';

import {
  Sparkles,
  FileText,
  Lightbulb,
  X,
  ChevronRight,
  Loader2,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useGeneratePresentationOutline } from '@/hooks/use-presentation-generation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { CreateWithAiOutline } from './CreateWithAiOutline';


const aiOptions = [
  { icon: FileText, label: 'Create from Document' },
  { icon: Lightbulb, label: 'Start with a Topic' },
];

export function CreateWithAiPanel({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void }) {
    const [prompt, setPrompt] = useState('');
    const [generatedOutline, setGeneratedOutline] = useState<GeneratePresentationOutlineOutput | null>(null);
    const { toast } = useToast();
    const outlineMutation = useGeneratePresentationOutline({
        onSuccess: (data) => {
            setGeneratedOutline(data);
            toast({ title: "Outline Generated!", description: "Review the outline-solid and choose a template to proceed."});
        },
        onError: (error) => {
            toast({ title: "Outline Generation Failed", description: error.message, variant: "destructive" });
        }
    });

    const handleGenerate = () => {
        if(!prompt.trim()) {
            toast({ title: "Topic is required", variant: "destructive"});
            return;
        }
        outlineMutation.mutate({ prompt });
    }

  if (generatedOutline) {
    return <CreateWithAiOutline outline={generatedOutline} onBack={() => setGeneratedOutline(null)} onClose={() => onOpenChange(false)} />;
  }

  return (
    <Card className="absolute right-0 top-0 bottom-0 w-80 bg-white z-20 shadow-lg flex flex-col rounded-none border-l">
      <CardHeader className="flex-row items-center justify-between p-2 border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Create with AI
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 grow space-y-4">
        {aiOptions.map(option => (
          <Button key={option.label} variant="outline" className="w-full justify-between h-auto py-2">
            <div className="flex items-center gap-3">
              <option.icon className="w-5 h-5 text-slate-500" />
              <span className="font-normal">{option.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Button>
        ))}
        <div className="space-y-2">
            <Textarea
                placeholder="Enter a topic..."
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={outlineMutation.isPending}
            />
             <Button className="w-full" onClick={handleGenerate} disabled={outlineMutation.isPending}>
                {outlineMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Wand2 className="w-4 h-4 mr-2" />}
                Generate Outline
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
