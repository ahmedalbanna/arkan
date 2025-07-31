
'use client';

import StudentRequestForm from '@/components/StudentRequestForm';
import { PencilLine } from 'lucide-react';
import Image from 'next/image';

export default function RequestPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-65px)] lg:grid-cols-2 xl:min-h-[calc(100vh-65px)]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[450px] gap-6 px-4">
          <div className="grid gap-2 text-center">
             <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <PencilLine className="w-8 h-8" />
             </div>
            <h1 className="text-3xl font-bold text-primary">Submit Your Request</h1>
            <p className="text-balance text-muted-foreground">
              Tell us what you need. Provide your requirements and contact details, and we'll get to work.
            </p>
          </div>
          <StudentRequestForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Student collaborating"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="student collaboration"
        />
      </div>
    </div>
  );
}
