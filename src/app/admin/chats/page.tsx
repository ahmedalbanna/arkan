
'use client';

import ChatInterface from '@/components/chat/ChatInterface';
import { MessageSquare } from 'lucide-react';

export default function AdminChatsPage() {
  return (
    <div className="h-[calc(100vh-140px)]">
       <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Conversations
            </h1>
        </div>
      <ChatInterface />
    </div>
  );
}
