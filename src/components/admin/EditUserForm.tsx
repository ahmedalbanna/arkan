
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateUser } from '@/hooks';
import { UserProfile } from '@/lib/models';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/util/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0, "Credits cannot be negative."),
  role: z.enum(['user', 'admin']),
  hasCompletedOnboarding: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditUserFormProps {
  user: UserProfile;
}

export default function EditUserForm({ user }: EditUserFormProps) {
    const { userProfile: adminProfile } = useAuth();
    const { toast } = useToast();
    const updateUserMutation = useUpdateUser();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || '',
            email: user.email || '',
            bio: user.bio || '',
            credits: user.credits || 0,
            role: user.role || 'user',
            hasCompletedOnboarding: user.hasCompletedOnboarding || false,
        },
    });

    useEffect(() => {
        form.reset({
            name: user.name || '',
            email: user.email || '',
            bio: user.bio || '',
            credits: user.credits || 0,
            role: user.role || 'user',
            hasCompletedOnboarding: user.hasCompletedOnboarding || false,
        });
    }, [user, form]);

    const onSubmit = (data: ProfileFormValues) => {
        const payload: Partial<ProfileFormValues> = {};
        
        // Build payload with only changed values
        for (const key in data) {
            const formKey = key as keyof ProfileFormValues;
            if (data[formKey] !== user[formKey]) {
                (payload as any)[formKey] = data[formKey];
            }
        }
        
        if (Object.keys(payload).length === 0) {
            toast({ title: 'No Changes', description: 'No changes were made to the user profile.' });
            return;
        }

        updateUserMutation.mutate({ userId: user.id, data: payload });
    };

    const isAdmin = adminProfile?.role === 'admin';

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>User Profile</CardTitle>
                        <CardDescription>Edit the user's information below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={updateUserMutation.isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} disabled={!isAdmin || updateUserMutation.isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} disabled={updateUserMutation.isPending} placeholder="A short bio about the user..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isAdmin && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="credits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>AI Credits</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} disabled={updateUserMutation.isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={updateUserMutation.isPending}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                <FormField
                                    control={form.control}
                                    name="hasCompletedOnboarding"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Onboarding Completed</FormLabel>
                                                <FormDescription>
                                                    If disabled, the user will see the onboarding guide on their next visit.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={updateUserMutation.isPending}>
                            {updateUserMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
