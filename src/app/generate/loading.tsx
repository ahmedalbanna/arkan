
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-headline font-bold text-primary mb-4 animate-pulse">
          Arkan
        </h1>
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading Builder...</p>
          </div>
          <div className="text-sm opacity-75">
            Preparing your creative workspace
          </div>
        </div>
        {/* Simple loading indicator */}
        <div className="mt-8 w-48">
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
