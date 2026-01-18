'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

interface CodeBlockProps {
  data: object;
  title: string;
}

export function CodeBlock({ data, title }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setIsCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm">{title}</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="text-xs border rounded-md p-4 bg-muted/50 max-h-64 overflow-y-auto">
        <ReactJson
          src={data}
          theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'}
          collapsed={false}
          displayDataTypes={false}
          name={false}
          style={{ background: 'transparent' }}
        />
      </div>
    </div>
  );
}
