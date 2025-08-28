
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

interface DynamicImageProps {
  alt: string;
  width: number;
  height: number;
  className?: string;
  'data-ai-hint': string;
}

const imageQueryFn = async (prompt: string, token: string | null) => {
    if (!prompt || !token) return null;
    const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        // Don't throw error, just return null to show placeholder
        console.error("Failed to generate image for prompt:", prompt);
        return null;
    }
    const data = await response.json();
    return data.imageUrl;
};

// IMPORTANT: This component is now deprecated for template previews, which use a stored imageUrl.
// It is kept for other potential dynamic image needs in the application.
export default function DynamicImage({ alt, 'data-ai-hint': dataAiHint, ...props }: DynamicImageProps) {
  const { firebaseUser } = useAuth();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
        if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            setAuthToken(token);
        }
    };
    getToken();
  }, [firebaseUser]);

  const { data: imageUrl, isLoading } = useQuery({
      queryKey: ['generated-image', dataAiHint],
      queryFn: () => imageQueryFn(dataAiHint, authToken),
      enabled: !!dataAiHint && !!authToken,
      staleTime: Infinity, // Cache forever
      gcTime: Infinity, // Cache forever
      retry: false, // Don't retry on failure
  });

  const placeholderUrl = `https://placehold.co/${props.width}x${props.height}.png`;

  if (isLoading || !imageUrl) {
    return <Skeleton className={props.className} style={{ width: props.width, height: props.height }} />;
  }

  return (
    <Image
      src={imageUrl || placeholderUrl}
      alt={alt}
      {...props}
    />
  );
}
