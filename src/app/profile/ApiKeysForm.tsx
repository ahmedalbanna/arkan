
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateUser } from '@/hooks';
import { UserProfile } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showChatGPTKey, setShowChatGPTKey] = useState(false);

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
    const apiKeys: Record<string, string> = {
      gemini: data.gemini || '',
      chatgpt: data.chatgpt || '',
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
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showGeminiKey ? 'text' : 'password'}
                        {...field}
                        placeholder="Enter your Gemini API key"
                        disabled={updateUserMutation.isPending}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                    >
                      {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
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
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showChatGPTKey ? 'text' : 'password'}
                        {...field}
                        placeholder="Enter your ChatGPT API key"
                        disabled={updateUserMutation.isPending}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowChatGPTKey(!showChatGPTKey)}
                    >
                      {showChatGPTKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
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
