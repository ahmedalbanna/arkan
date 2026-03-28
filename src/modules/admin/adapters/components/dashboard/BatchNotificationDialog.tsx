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
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Loader2, Send } from 'lucide-react';
import { apiService } from '@/infrastructure/api/ApiService';
import { useToast } from '@/hooks/util/use-toast';

const batchNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Message is required'),
  type: z.enum(['info', 'success', 'warning', 'error', 'alert']).default('info'),
  link: z.string().optional(),
});

type BatchNotificationValues = z.infer<typeof batchNotificationSchema>;

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { DialogClose } from '@/components/ui/dialog';

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

      toast({ title: 'Success', description: 'Batch notification sent to all users.' });
      setIsOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send batch notification', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all duration-300"
        >
          <Megaphone className="h-3.5 w-3.5 text-primary" />
          Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-auto p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl rounded-[32px] bg-background">
        <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <DialogTitle className="text-xl font-bold font-headline tracking-tight leading-none">Intelligence Broadcast Manifest</DialogTitle>
          </div>
          <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            System Overload Possible
          </Badge>
        </header>

        <div className="p-8 md:p-10 space-y-8">
            <div className="space-y-1.5">
                <h4 className="text-sm font-semibold tracking-tight">Global Signal Distribution</h4>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    This protocol will transmit a high-priority signal to <span className="text-primary font-bold not-italic">EVERY</span> active node in the Arkan network.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Signal Identity</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Global Announcement" {...field} disabled={isSubmitting} className="h-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Protocol Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                                <SelectItem value="info" className="text-xs">Standard Info</SelectItem>
                                                <SelectItem value="success" className="text-xs">Operation Success</SelectItem>
                                                <SelectItem value="warning" className="text-xs">Security Warning</SelectItem>
                                                <SelectItem value="error" className="text-xs">Critical Failure</SelectItem>
                                                <SelectItem value="alert" className="text-xs">High Alert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Payload Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Define the primary message payload..." {...field} disabled={isSubmitting} rows={4} className="text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Redirect Node (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="/docs" {...field} disabled={isSubmitting} className="h-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl" />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-primary/40 uppercase tracking-widest pointer-events-none">Path</div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-10 px-6 rounded-xl">
                                Abort
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="font-bold h-11 px-10 gap-3 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Initialize Broadcast
                        </Button>
                    </div>
                </form>
            </Form>
        </div>

        <footer className="px-8 py-4 border-t bg-muted/5 text-center">
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
                Arkan Broadcast Engine • V1.0 Stable
            </p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
