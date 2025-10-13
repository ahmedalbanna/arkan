
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateUserDialog } from '@/hooks';
import { Loader2, PlusCircle, UserPlus } from 'lucide-react';

export function CreateUserDialog() {
  const { isOpen, setIsOpen, form, mutation, onSubmit } = useCreateUserDialog();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="gradient" className="hover:shadow-glow transition-all duration-200">
          <PlusCircle className="me-2 h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-md">
        <DialogHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-headline font-semibold">Create New User</DialogTitle>
              <DialogDescription>
                Fill out the form below to add a new user to the system.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <AnimatedContainer animation="fade-in-up" delay={100}>
               <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl><Input id="name" {...field} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200" /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
             </AnimatedContainer>
             <AnimatedContainer animation="fade-in-up" delay={200}>
               <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input id="email" type="email" {...field} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200" /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
             </AnimatedContainer>
             <AnimatedContainer animation="fade-in-up" delay={300}>
               <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input id="password" type="password" {...field} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200" /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
             </AnimatedContainer>
             <AnimatedContainer animation="fade-in-up" delay={400}>
               <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name} disabled={mutation.isPending}>
                              <FormControl>
                                  <SelectTrigger id="role" className="hover:shadow-soft transition-all duration-200"><SelectValue placeholder="Select a role" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
             </AnimatedContainer>
             <AnimatedContainer animation="fade-in-up" delay={500}>
               <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Credits</FormLabel>
                          <FormControl><Input id="credits" type="number" {...field} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200" /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
             </AnimatedContainer>
            <DialogFooter>
                <Button type="submit" disabled={mutation.isPending} variant="gradient" className="hover:shadow-glow transition-all duration-200">
                    {mutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    Create User
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
