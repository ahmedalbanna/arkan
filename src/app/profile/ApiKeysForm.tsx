
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateUser } from '@/hooks';
import { UserProfile } from '@/lib/models';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';

const apiKeysSchema = z.object({
  gemini: z.string().optional(),
  chatgpt: z.string().optional(),
});

type ApiKeysFormValues = z.infer<typeof apiKeysSchema>;

interface ApiKeysFormProps {
  userProfile: UserProfile;
}

export function ApiKeysForm({ userProfile }: ApiKeysFormProps) {
  const updateUserMutation = useUpdateUser();

  const form = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      gemini: userProfile.apiKeys?.['gemini'] || '',
      chatgpt: userProfile.apiKeys?.['chatgpt'] || '',
    },
  });
  
  useEffect(() => {
    form.reset({
      gemini: userProfile.apiKeys?.['gemini'] || '',
      chatgpt: userProfile.apiKeys?.['chatgpt'] || '',
    });
  }, [userProfile, form]);

  const onSubmit = (data: ApiKeysFormValues) => {
    const apiKeys = {
        gemini: data.gemini,
        chatgpt: data.chatgpt,
    };
    updateUserMutation.mutate({ userId: userProfile.id, data: { apiKeys } });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>AI Provider API Keys</CardTitle>
            <CardDescription>
              Provide your own API keys for AI services. These will be used for all AI generations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="gemini"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Gemini API Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="Enter your Gemini API key" disabled={updateUserMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chatgpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI ChatGPT API Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="Enter your ChatGPT API key" disabled={updateUserMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save API Keys
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
