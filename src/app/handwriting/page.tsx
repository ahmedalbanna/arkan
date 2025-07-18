
import HandwritingGenerator from '@/components/HandwritingGenerator';
import { PencilLine } from 'lucide-react';

export default function HandwritingPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <PencilLine className="w-10 h-10" />
          Text to Handwriting
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your typed text into a realistic handwriting style.
        </p>
      </div>
      <HandwritingGenerator />
    </div>
  );
}
