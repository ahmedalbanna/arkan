
'use client';

import type { ChatSession } from './ChatList';
import { Button } from '../ui/button';
import { Plus, MessageSquare, Edit2, RotateCcw, Expand, X } from 'lucide-react';
import { Card, CardHeader } from '../ui/card';

interface ConversationViewProps {
  chat: ChatSession | null;
}

export function ConversationView({ chat }: ConversationViewProps) {
  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-8">
        <div className="text-center">
          <div className="mb-4 text-muted-foreground">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <path
                d="M65 40C65 53.8071 53.8071 65 40 65C34.6562 65 29.7441 63.2289 25.8322 60.2435L25 59.625V55C25 54.4477 25.4477 54 26 54H30.375L31.0007 53.166C34.7711 48.3438 40 45.4167 40 35C40 21.1929 28.8071 10 15 10C10.7833 10 6.85621 11.2289 3.5 13.374"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50"
              />
              <path
                d="M55 25C55 33.2843 48.2843 40 40 40C31.7157 40 25 33.2843 25 25C25 16.7157 31.7157 10 40 10C48.2843 10 55 16.7157 55 25Z"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-90"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">Start a conversation</h2>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Let's dive into a world of endless possibilities. Start a conversation, spark creativity, and explore new horizons together.
          </p>
          <Button className="mt-6">
            <Plus className="mr-2 h-4 w-4" />
            New chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">{chat.title}</h2>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Expand className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <div className="flex-1 p-4">
        {/* Conversation messages will go here */}
        <p>Conversation for: {chat.title}</p>
      </div>
       <div className="p-4 border-t">
        {/* Message input bar will go here */}
       </div>
    </div>
  );
}
