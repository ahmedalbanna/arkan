
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/util/use-toast';
import { v4 as uuidv4 } from 'uuid';

const imageGeneratorSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required.'),
  width: z.number().min(64).max(2048).default(800),
  height: z.number().min(64).max(2048).default(600),
  seed: z.number().optional(), // Make seed optional initially
});

type FormValues = z.infer<typeof imageGeneratorSchema>;

interface HistoryItem extends FormValues {
  id: string;
  url: string;
  createdAt: string;
}

const API_BASE_URL = 'https://image.pollinations.ai/prompt/';

export function useAIImageGeneratorLogic() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(imageGeneratorSchema),
    defaultValues: {
      prompt: 'Arkan Logo',
      width: 800,
      height: 600,
      seed: undefined, // Initialize as undefined
    },
  });

  useEffect(() => {
    // Generate the seed only on the client side after hydration
    if (form.getValues('seed') === undefined) {
      form.setValue('seed', Math.floor(Math.random() * 10000000000));
    }
  }, [form]);


  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ai-image-generator-history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from local storage", error);
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      setHistory(newHistory);
      localStorage.setItem('ai-image-generator-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history to local storage", error);
      toast({ title: "Error", description: "Could not save image history.", variant: "destructive" });
    }
  };


  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setImageUrl('');
    try {
      const url = `${API_BASE_URL}${encodeURIComponent(data.prompt)}?width=${data.width}&height=${data.height}&nologo=poll&nofeed=yes&seed=${data.seed}`;
      
      // We don't need to fetch and convert to blob if the browser can display the URL directly
      // This also helps with downloading as we can just link to the URL
      setImageUrl(url);

    } catch (error) {
      console.error('Image generation failed:', error);
      toast({
        title: 'Image Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!imageUrl) {
      toast({ title: "No Image", description: "Please generate an image first before saving.", variant: "destructive" });
      return;
    }
    const currentValues = form.getValues();
    const newItem: HistoryItem = {
      id: uuidv4(),
      ...currentValues,
      url: imageUrl,
      createdAt: new Date().toISOString(),
    };
    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    saveHistory(newHistory);
    toast({ title: "Image Saved", description: "The image has been saved to your local history." });
  };
  
  const handleDelete = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
    toast({ title: "Image Removed", description: "The image has been removed from your history." });
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok.');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      toast({ title: 'Download Failed', description: 'Could not download the image.', variant: 'destructive' });
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    form.reset(item);
    setImageUrl(item.url);
  };

  return {
    form,
    onSubmit,
    isLoading,
    imageUrl,
    history,
    handleSave,
    handleDelete,
    handleDownload,
    handleLoadFromHistory,
  };
}
