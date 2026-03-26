
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser } from '@/modules/users/adapters/hooks/use-users';
import { toast } from '@/hooks/util/use-toast';

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['user', 'admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function useCreateUserDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'user',
            credits: 10,
        },
    });

    const mutation = useCreateUser({
        onSuccess: () => {
            toast({ title: 'User Created', description: 'The new user has been successfully added.' });
            setIsOpen(false);
            form.reset();
        },
    });

    const onSubmit = (data: CreateUserFormValues) => {
        mutation.mutate(data);
    };

    return {
        isOpen,
        setIsOpen,
        form,
        mutation,
        onSubmit
    }
}
