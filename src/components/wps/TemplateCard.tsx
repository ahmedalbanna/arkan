
'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export const TemplateCard = ({
  icon,
  title,
  imgSrc,
  imgAlt,
  tag,
  dataAiHint,
  size = 'small',
  onClick,
}: {
  icon?: React.ReactNode;
  title: string;
  imgSrc?: string;
  imgAlt?: string;
  tag?: 'NEW' | 'HOT';
  dataAiHint?: string;
  size?: 'small' | 'large';
  onClick?: () => void;
}) => {
  const sizeClasses = size === 'small' 
    ? 'w-32 h-40'
    : 'w-full';

  return (
    <div className="flex flex-col items-start gap-2 cursor-pointer group" onClick={onClick}>
      <div className={`${sizeClasses} bg-white rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-blue-500 relative overflow-hidden`}>
        {imgSrc ? (
          <Image src={imgSrc} alt={imgAlt || title} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint={dataAiHint}/>
        ) : (
          icon
        )}
        {tag && (
          <Badge
            className={`absolute top-2 left-2 ${tag === 'NEW' ? 'bg-orange-400' : 'bg-red-400'} text-white`}
          >
            {tag}
          </Badge>
        )}
      </div>
      <span className="text-sm font-medium text-slate-700">{title}</span>
    </div>
  );
};
