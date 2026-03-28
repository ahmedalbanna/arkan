'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, User, ShieldCheck, Gem, KeyRound, Globe, Zap } from 'lucide-react';
import { useCreateUserDialog } from '@/modules/admin/adapters/hooks/use-create-user-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { Label } from '@/components/ui/label';

export function CreateUserDialog() {
  const { isOpen, setIsOpen, form, mutation, onSubmit } = useCreateUserDialog();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-bold h-9 gap-2 shadow-lg shadow-primary/20 rounded-xl">
          <PlusCircle className="h-4 w-4" />
          Provision User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-auto p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl rounded-[32px] bg-background">
        <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <DialogTitle className="text-xl font-bold font-headline tracking-tight leading-none">Identity Provisioning Manifest</DialogTitle>
          </div>
          <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Privileged Operation
          </Badge>
        </header>

        <div className="p-8 md:p-10 space-y-8">
            <div className="space-y-1.5">
                <h4 className="text-sm font-semibold tracking-tight">System Identity Generation</h4>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    Initialize a new logical node within the Arkan directory. All credentials will be encrypted at the database layer.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="grid gap-10">
                        {/* Core Identity */}
                        <div className="space-y-6">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                <User className="h-3 w-3 text-primary" />
                                Core Identity
                            </Label>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Legal Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input placeholder="John Doe" {...field} disabled={mutation.isPending} className="h-10 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl" />
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">System Endpoint</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input placeholder="user@arkan.ai" type="email" {...field} disabled={mutation.isPending} className="h-10 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl" />
                                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator className="bg-border/40" />

                        {/* Access & Resources */}
                        <div className="space-y-6">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3 text-primary" />
                                Access & Resources
                            </Label>
                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Access Key</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type="password" {...field} disabled={mutation.isPending} className="h-10 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl" />
                                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">System Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name} disabled={mutation.isPending}>
                                                <FormControl>
                                                    <SelectTrigger id="role" className="h-10 bg-muted/5 border-none shadow-inner rounded-xl text-xs"><SelectValue placeholder="Select role" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                                    <SelectItem value="user" className="text-xs">Standard User</SelectItem>
                                                    <SelectItem value="admin" className="text-xs">Privileged Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="credits"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Initial Quota</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type="number" {...field} disabled={mutation.isPending} className="h-10 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl font-bold tabular-nums" />
                                                    <Gem className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-11 px-8 rounded-xl">
                                Abort
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="font-bold h-11 px-10 gap-3 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                        >
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-primary-foreground" />}
                            Initialize Provisioning
                        </Button>
                    </div>
                </form>
            </Form>
        </div>

        <footer className="px-8 py-4 border-t bg-muted/5 text-center">
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
                Arkan Identity Engine • Node V1.0 Stable
            </p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
