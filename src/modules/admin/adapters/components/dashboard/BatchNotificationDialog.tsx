'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Loader2, Send, ShieldAlert, Cpu } from 'lucide-react';
import { apiService } from '@/infrastructure/api/ApiService';
import { useToast } from '@/hooks/util/use-toast';
import { cn } from '@/infrastructure/utils/cn';

/**
 * BatchNotificationDialog — Administrative broadcast manifest for global system alerts.
 * Transmits high-priority signals to all active nodes in the network.
 * 
 * DEFENSIVE MEASURES:
 * 1. Submission Containment: Wraps API transmission in a robust try-catch block.
 * 2. Visual Feedback: Implements active status pulses and high-fidelity loading states.
 * 3. Atomic Reset: Correctly clears form state and closes manifest on successful dispatch.
 * 4. Technical Aesthetic: Standardized dot grids and technical typography.
 */

const batchNotificationSchema = z.object({
  title: z.string().min(1, 'Signal identity is required.'),
  description: z.string().min(1, 'Message payload is required.'),
  type: z.enum(['info', 'success', 'warning', 'error', 'alert']).default('info'),
  link: z.string().optional(),
});

type BatchNotificationValues = z.infer<typeof batchNotificationSchema>;

export function BatchNotificationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BatchNotificationValues>({
    resolver: zodResolver(batchNotificationSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'info',
      link: '',
    },
  });

  const onSubmit = async (values: BatchNotificationValues) => {
    setIsSubmitting(true);
    try {
      await apiService({
        endpoint: '/api/admin/notifications/batch',
        method: 'POST',
        data: values,
      });

      toast({ 
        title: 'Transmission Successful', 
        description: 'Global signal successfully broadcast to all active system nodes.' 
      });
      setIsOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('[BroadcastEngine] Dispatch failure:', error);
      toast({ 
        title: 'Transmission Error', 
        description: error.message || 'The broadcast engine failed to synchronize the signal.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !isSubmitting && setIsOpen(v)}>
      <DialogTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
        >
          <Megaphone className="h-3.5 w-3.5 text-primary" />
          Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">
        <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between shrink-0 relative overflow-hidden">
            {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />
            
            <div className="flex items-center gap-5 relative z-10">
                <div className="h-12 w-12 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/logo">
                    <div className="absolute inset-0 bg-primary/5 blur-lg group-hover:blur-xl transition-all" />
                    <Cpu className="h-6 w-6 text-primary relative z-10 transition-transform duration-500 group-hover:rotate-12" />
                </div>
                <div>
                    <DialogTitle className="text-[18px] font-black uppercase tracking-tight text-foreground/90">Signal Manifest</DialogTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)]",
                            isSubmitting ? "bg-amber-500 animate-pulse" : "bg-primary"
                        )} />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/70">
                            Global Broadcast Protocol Engaged
                        </p>
                    </div>
                </div>
            </div>
            <Badge variant="outline" className="h-6 text-[10px] uppercase tracking-[0.2em] font-black border-primary/20 text-primary bg-primary/5 px-3 rounded-full relative z-10">
                Level 4 Access
            </Badge>
        </header>

        <div className="flex-1 overflow-hidden relative min-h-0 bg-background/20 p-10 md:p-12">
            <div className="space-y-10 max-w-2xl mx-auto relative">
                {/* Depth architectural line */}
                <div className="absolute left-[-2rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                <div className="space-y-2 px-1">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.1em] text-foreground/80">Network Infiltration</h4>
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed font-medium">
                        Define the neural signal to be transmitted to all active system nodes. High-priority signals will trigger immediate UI pulses.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid gap-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Signal Identity</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="ANNOUNCEMENT_VECTOR" 
                                                    {...field} 
                                                    disabled={isSubmitting} 
                                                    className="h-11 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all uppercase tracking-widest" 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Protocol Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 text-[11px] font-bold bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl uppercase tracking-widest">
                                                        <SelectValue placeholder="SELECT_PROTOCOL" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                                                    <SelectItem value="info" className="text-[10px] font-black uppercase py-2.5">Standard Info</SelectItem>
                                                    <SelectItem value="success" className="text-[10px] font-black uppercase py-2.5">Operation Success</SelectItem>
                                                    <SelectItem value="warning" className="text-[10px] font-black uppercase py-2.5">Security Warning</SelectItem>
                                                    <SelectItem value="error" className="text-[10px] font-black uppercase py-2.5">Critical Failure</SelectItem>
                                                    <SelectItem value="alert" className="text-[10px] font-black uppercase py-2.5">High Alert</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-2.5">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Payload Description</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Initialize the primary message payload for this broadcast..." 
                                                {...field} 
                                                disabled={isSubmitting} 
                                                rows={4} 
                                                className="min-h-[120px] text-[12px] font-serif italic bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl shadow-inner resize-none p-5 leading-relaxed" 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="link"
                                render={({ field }) => (
                                    <FormItem className="space-y-2.5">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Redirect Node (Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input 
                                                    placeholder="/system/ledger" 
                                                    {...field} 
                                                    disabled={isSubmitting} 
                                                    className="h-11 pl-14 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all shadow-inner tabular-nums" 
                                                />
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary/40 uppercase tracking-widest pointer-events-none group-focus-within:text-primary transition-colors">Path:</div>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-6 flex justify-between items-center">
                            <DialogClose asChild>
                                <Button variant="ghost" disabled={isSubmitting} className="text-[10px] font-black uppercase tracking-[0.2em] h-11 px-8 rounded-xl hover:bg-red-500/5 hover:text-red-600 transition-all">
                                    Abort Manifest
                                </Button>
                            </DialogClose>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="h-12 px-12 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 bg-primary hover:opacity-90 gap-3 rounded-xl transition-all hover:scale-105 active:scale-95 ring-1 ring-inset ring-white/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Synthesizing Signal...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        <span>Initialize Broadcast</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>

        <footer className="px-10 py-6 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="h-1 w-1 rounded-full bg-primary/30" />
                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
                    Arkan Broadcast Engine • Stable Build 2.4
                </p>
            </div>
            <div className="flex items-center gap-2.5 opacity-40">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span className="text-[8px] font-black uppercase tracking-widest">Priority Overload Guard Active</span>
            </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
