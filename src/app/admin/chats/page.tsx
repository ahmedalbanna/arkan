
'use client';

import ChatInterface from '@/components/chat/ChatInterface';
import { Bot } from 'lucide-react';

export default function AdminChatsPage() {
  return (
    <div className="h-[calc(100vh-140px)]">
       <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Bot className="h-6 w-6" />
                Agent Training & Support Chat
            </h1>
        </div>
      <ChatInterface />
    </div>
  );
}
