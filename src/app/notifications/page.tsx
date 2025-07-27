
'use client';

import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Bell className="w-10 h-10" />
          Push Notifications
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          This feature is coming soon.
        </p>
      </div>
    </div>
  );
}
