
'use client';
import { useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  file: z
    .instanceof(File, { message: 'A file is required.' })
    .refine((file) => file.size < 5 * 1024 * 1024, 'File size must be less than 5MB.')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'Invalid file type. Only JPG, PNG, and PDF are allowed.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planId = searchParams.get('planId');
  const planName = searchParams.get('planName');
  const planCredits = searchParams.get('credits');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!planId || !planCredits || !firebaseUser) {
      toast({
        title: 'Error',
        description: 'Missing required information. Please go back to the pricing page and select a plan.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('userId', firebaseUser.uid);
    formData.append('planId', planId);
    formData.append('credits', planCredits);
    formData.append('userName', firebaseUser.displayName || 'N/A');
    formData.append('userEmail', firebaseUser.email || 'N/A');

    try {
      const response = await fetch('/api/purchase-request', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request.');
      }

      toast({
        title: 'Request Submitted',
        description: 'Your payment proof has been uploaded. An admin will review it shortly.',
      });
      router.push('/generate');

    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Bank Transfer Details</CardTitle>
          <CardDescription>Please transfer the required amount to the account below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm bg-muted p-4 rounded-lg">
          <p><strong>Bank Name:</strong> Arkan National Bank</p>
          <p><strong>Account Holder:</strong> Arkan Professional Platform</p>
          <p><strong>IBAN:</strong> SA03 8000 0000 6080 1016 7519</p>
          <p><strong>Reference:</strong> Your User ID ({firebaseUser?.uid || 'Please log in'})</p>
        </CardContent>
      </Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipt</CardTitle>
            {planName && <CardDescription>You have selected the <strong>{planName}</strong> plan.</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="file">Proof of Payment</Label>
              <Controller
                name="file"
                control={form.control}
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <Input
                    id="file"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => onChange(e.target.files?.[0])}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                    className="file:text-primary file:font-semibold"
                  />
                )}
              />
              {form.formState.errors.file && <p className="text-sm text-destructive">{form.formState.errors.file.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Submit for Verification
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
