
'use client';

import { ImageConversionApiClient } from '@/modules/ai/adapters/api-client/ImageConversionApiClient';
import { container } from '@/infrastructure/di/container';
import { useToast } from '@/hooks/util/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  file: z.instanceof(File).optional(),
  mode: z.enum(['flat', 'line', 'lowpoly']).default('flat'),
  quality: z.string().optional(),
  colors: z.number().optional(),
  min_area: z.number().optional(),
  epsilon: z.number().optional(),
  close_kernel: z.number().optional(),
  adaptive: z.boolean().optional(),
  invert: z.boolean().optional(),
  blur: z.number().optional(),
  line_output: z.string().optional(),
  stroke_color: z.string().optional(),
  stroke_width_scale: z.number().optional(),
  centerline: z.boolean().optional(),
  centerline_prune: z.number().optional(),
  centerline_rdp: z.number().optional(),
  bezier: z.boolean().optional(),
  bezier_recursive: z.boolean().optional(),
  bezier_seglen: z.number().optional(),
  bezier_maxerr: z.number().optional(),
  points: z.number().optional(),
  tri_blur: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useImageToSvgLogic() {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [svgResult, setSvgResult] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      form.setValue('file', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => container.resolve(ImageConversionApiClient).convertImageToSvgApi(formData),
    onSuccess: (data) => {
      setSvgResult(data);
      toast({ title: 'Conversion Successful', description: 'Image has been converted to SVG.' });
    },
    onError: (error: any) => {
      toast({ title: 'Conversion Failed', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!data.file) {
      toast({ title: 'No Image Selected', description: 'Please upload an image to convert.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (value instanceof File) {
            formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    mutation.mutate(formData);
  };

  const handleCopy = () => {
    if (!svgResult) return;
    navigator.clipboard.writeText(svgResult).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!svgResult) return;
    const blob = new Blob([svgResult], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.getValues('file')?.name.split('.')[0] || 'converted'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return {
    form,
    onSubmit,
    mutation,
    getRootProps,
    getInputProps,
    isDragActive,
    previewImage,
    svgResult,
    isCopied,
    handleCopy,
    handleDownload,
  };
}
