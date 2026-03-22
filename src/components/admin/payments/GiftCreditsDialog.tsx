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
import { User } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { userKeys } from '@/lib/query-keys';
import { apiService } from '@/infrastructure/api/ApiService';

const giftCreditsSchema = z.object({
  credits: z.coerce.number().int().min(1, 'Must gift at least 1 credit.'),
  message: z.string().optional(),
});

type GiftCreditsFormValues = z.infer<typeof giftCreditsSchema>;
interface GiftCreditsDialogProps { user: User; }

export function GiftCreditsDialog({ user }: GiftCreditsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<GiftCreditsFormValues>({ resolver: zodResolver(giftCreditsSchema), defaultValues: { credits: 10, message: '' } });

  const mutation = useMutation({
    mutationFn: (data: GiftCreditsFormValues) => {
      if (!firebaseUser) throw new Error('Admin not authenticated.');
      return apiService<GiftCreditsFormValues & { userId: string }, { message: string }>({ endpoint: '/api/admin/gift-credits', method: 'POST', firebaseUser, data: { ...data, userId: user.id } });
    },
    onSuccess: (data) => {
      toast({ title: 'Credits Gifted', description: data.message });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(user.id) });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon"><Gift className="h-4 w-4" /><span className="sr-only">Gift Credits</span></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Gift Credits to {user.name}</DialogTitle><DialogDescription>Send credits to this user. They will be notified of your gift.</DialogDescription></DialogHeader>
        <Form {...form}><form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <FormField control={form.control} name="credits" render={({ field }) => <FormItem><FormLabel>Credits to Gift</FormLabel><FormControl><Input type="number" {...field} disabled={mutation.isPending} /></FormControl><FormMessage /></FormItem>} />
          <FormField control={form.control} name="message" render={({ field }) => <FormItem><FormLabel>Message (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Thanks for being a great customer!" {...field} disabled={mutation.isPending} /></FormControl><FormMessage /></FormItem>} />
          <DialogFooter><Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}Send Gift</Button></DialogFooter>
        </form></Form>
      </DialogContent>
    </Dialog>
  );
}
