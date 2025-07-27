
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-headline font-bold text-primary mb-4 animate-pulse">
          Arkan
        </h1>
        <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-lg">Loading Builder...</p>
        </div>
      </div>
    </div>
  );
}
