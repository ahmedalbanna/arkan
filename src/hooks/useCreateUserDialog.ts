'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { useToast } from '@/hooks/use-toast';
import { createUserService } from '@/services/user-service';

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['user', 'admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function useCreateUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const mutation = useMutation({
    mutationFn: (data: CreateUserFormValues) => {
        if (!firebaseUser) throw new Error("Not authenticated");
        return firebaseUser.getIdToken().then(token => createUserService(data, token));
    },
    onSuccess: (data) => {
      toast({
        title: "User Created",
        description: `User ${data.user.name} has been successfully created.`,
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
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
    onSubmit,
  };
}
