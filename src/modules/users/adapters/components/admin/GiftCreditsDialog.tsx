'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Loader2 } from 'lucide-react';
import { User } from '@/modules/users/domain/entities/User';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { userKeys } from '@/infrastructure/api/query-keys';
import { apiService } from '@/infrastructure/api/ApiService';

const giftCreditsSchema = z.object({
  credits: z.coerce.number().int().min(1, 'Must gift at least 1 credit.'),
  message: z.string().optional(),
});

type GiftCreditsFormValues = z.infer<typeof giftCreditsSchema>;
interface GiftCreditsDialogProps { user: User; }

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { DialogClose } from '@/components/ui/dialog';
import { Gem, Zap, Send, ShieldCheck, User as UserIcon } from 'lucide-react';

export function GiftCreditsDialog({ user: targetUser }: GiftCreditsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<GiftCreditsFormValues>({ resolver: zodResolver(giftCreditsSchema), defaultValues: { credits: 10, message: '' } });

  const mutation = useMutation({
    mutationFn: (data: GiftCreditsFormValues) => {
      if (!authUser) throw new Error('Admin not authenticated.');
      return apiService<GiftCreditsFormValues & { userId: string }, { message: string }>({ 
        endpoint: '/api/admin/gift-credits', 
        method: 'POST', 
        data: { ...data, userId: targetUser.id } 
      });
    },
    onSuccess: (data) => {
      toast({ title: 'Credits Gifted', description: data.message });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(targetUser.id) });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
            <Gift className="h-4 w-4" />
            <span className="sr-only">Gift Credits</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-auto p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl rounded-[32px] bg-background">
        <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <DialogTitle className="text-xl font-bold font-headline tracking-tight leading-none">Quota Distribution Manifest</DialogTitle>
          </div>
          <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Admin Privilege Node
          </Badge>
        </header>

        <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/[0.03] border border-primary/20">
                <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center shadow-sm">
                    <UserIcon className="h-6 w-6 text-primary/60" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Target Subject</span>
                    <span className="text-sm font-bold truncate tracking-tight">{targetUser.name}</span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="credits"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Acquisition Yield</FormLabel>
                                        <Badge variant="secondary" className="h-4.5 text-[9px] font-bold px-1.5 rounded-sm">Neural Units</Badge>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" {...field} disabled={mutation.isPending} className="h-11 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl font-black tabular-nums" />
                                            <Gem className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Distribution Context (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Define the rationale for this quota increase..." {...field} disabled={mutation.isPending} rows={3} className="text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed" />
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
                            disabled={mutation.isPending} 
                            className="font-bold h-11 px-10 gap-3 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                        >
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-primary-foreground" />}
                            Initialize Quota Gift
                        </Button>
                    </div>
                </form>
            </Form>
        </div>

        <footer className="px-8 py-4 border-t bg-muted/5 text-center">
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
                Arkan Quota Engine • Node V1.0 Stable
            </p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
