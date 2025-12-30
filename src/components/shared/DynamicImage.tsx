
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

interface DynamicImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  'data-ai-hint': string;
}

/**
 * A wrapper around the Next.js Image component that shows a skeleton loader
 * while the image is loading. This is used for displaying template previews
 * which are now static URLs.
 */
export default function DynamicImage({ src, alt, ...props }: DynamicImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to a placeholder if src is invalid
  const imageUrl = src || `https://placehold.co/${props.width}x${props.height}.png`;

  return (
    <div className={props.className} style={{ width: props.width, height: props.height, position: 'relative' }}>
      {isLoading && <Skeleton className="absolute inset-0" />}
      <Image
        src={imageUrl}
        alt={alt}
        {...props}
        layout="fill"
        objectFit="cover"
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)} // Stop loading on error to show placeholder or broken image icon
      />
    </div>
  );
}
