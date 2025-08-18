
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Send, Clipboard, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

// Schema for form validation
const formSchema = z.object({
  requirements: z.string().min(20, { message: 'Please provide at least 20 characters for your requirements.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  file: z
    .any()
    .refine((file) => !file || file.length === 0 || file[0].size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => !file || file.length === 0 || ACCEPTED_FILE_TYPES.includes(file[0].type),
      "Only .jpg, .jpeg, .png, .webp, .pdf, and .docx formats are supported."
    ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// API submission function
async function submitRequest(data: FormData): Promise<{ message: string; projectId: string }> {
    const response = await fetch('/api/student-request', {
        method: 'POST',
        body: data,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request.');
    }
    return response.json();
}

export default function StudentRequestForm() {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirements: '',
      email: '',
      phone: '',
      file: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: submitRequest,
    onSuccess: (data) => {
      setSubmissionId(data.projectId);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.append('requirements', values.requirements);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    if (values.file && values.file.length > 0) {
      formData.append('file', values.file[0]);
    }
    mutation.mutate(formData);
  }

  const copyToClipboard = () => {
    if (submissionId) {
      navigator.clipboard.writeText(submissionId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-6 pt-6">
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe what you need us to do in as much detail as possible..."
                        rows={6}
                        {...field}
                        disabled={mutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} disabled={mutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555-123-4567" {...field} disabled={mutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Upload File (Optional)</FormLabel>
                      <FormControl>
                          <Input
                              type="file"
                              onChange={(e) => field.onChange(e.target.files)}
                              disabled={mutation.isPending}
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Send className="me-2 h-4 w-4" />}
                Submit Request
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <AlertDialog open={!!submissionId} onOpenChange={() => setSubmissionId(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Request Submitted Successfully!</AlertDialogTitle>
                  <AlertDialogDescription>
                      Thank you! We've received your request. Please save the Project ID below for your records. You can use it to track the status of your request.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4 p-4 bg-muted rounded-md flex items-center justify-between gap-4">
                <code className="text-sm font-semibold text-muted-foreground truncate">{submissionId}</code>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setSubmissionId(null)}>Close</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
