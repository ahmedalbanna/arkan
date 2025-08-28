
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, User, Send, Paperclip, Info, Settings2, Loader2, RotateCcw } from 'lucide-react';
import { CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';
import type { AgentChatSession, ChatMessage, ChatSession } from '@/hooks';
import { getDatabase, ref, onValue, off, push, serverTimestamp, update } from 'firebase/database';
import { app } from '@/lib';

interface ConversationViewProps {
  chat: ChatSession | AgentChatSession | null;
}

async function agentChatApi(variables: { agentId: string; message: string; conversationId: string; token: string }) {
    const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${variables.token}`,
        },
        body: JSON.stringify({
            agentId: variables.agentId,
            message: variables.message,
            conversationId: variables.conversationId
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response from agent.');
    }
    return await response.json();
}

function MessageBubble({ role, content }: { role: 'user' | 'assistant', content: string }) {
    const isUser = role === 'user';
    return (
        <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
            {!isUser && (
                 <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5"/>
                </div>
            )}
            <div className={cn("p-3 rounded-lg max-w-lg", isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="text-sm whitespace-pre-wrap">{content}</p>
            </div>
             {isUser && (
                 <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                    <User className="h-5 w-5"/>
                </div>
            )}
        </div>
    )
}

export function ConversationView({ chat }: ConversationViewProps) {
  const { firebaseUser, refetchUser } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
    if (!chat) {
        setMessages([]);
        return;
    };

    // For all chats (including agent chats now), we listen to the DB
    const db = getDatabase(app);
    const messagesRef = ref(db, `messages/${chat.id}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const messagesList: ChatMessage[] = data ? Object.values(data) : [];
        setMessages(messagesList);
    }, (error) => {
        console.error("Error listening to messages:", error);
        setMessages([]); // Clear messages on error
    });

    return () => off(messagesRef, 'value', unsubscribe);

  }, [chat]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  const agentChatMutation = useMutation({
    mutationFn: agentChatApi,
    onSuccess: (data, variables) => {
        // The DB listener will handle message updates, so no need to set local state here.
        refetchUser(); // Update credits
    },
    onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !firebaseUser || !chat) return;

    const messageContent = input;
    setInput('');

    // All message sends now go through the backend agentChat API.
    // The backend will handle distinguishing between agent and user-to-user chats.
    // For user-to-user, it will just save the message. For agents, it will invoke the flow.
    const token = await getAuthenticatedToken(firebaseUser);

    // We use a "placeholder" agentId for user chats. The backend will ignore it.
    const agentId = chat.agent?.id || 'user-chat';

    agentChatMutation.mutate({
        agentId: agentId,
        message: messageContent,
        conversationId: chat.id,
        token
    });
  }


  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-8">
        <div className="text-center">
            <h2 className="text-2xl font-semibold">Select a Conversation</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">
                Choose a conversation or an agent from the sidebar to get started.
            </p>
        </div>
      </div>
    );
  }

  const isLoading = agentChatMutation.isPending;

  return (
    <div className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">{chat.title}</h2>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
            {messages.map((msg, index) => (
                <MessageBubble key={index} role={msg.role} content={msg.content} />
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5"/>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
        </div>
      </ScrollArea>

       <div className="p-4 border-t bg-background">
         <form onSubmit={handleSendMessage}>
            <div className="relative">
                <Textarea
                    placeholder={`Chat with ${chat.title}...`}
                    className="w-full resize-none rounded-lg border border-input bg-muted pr-16 py-3"
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground" disabled={!input.trim() || isLoading}>
                    <Send className="h-4 w-4"/>
                </Button>
            </div>
         </form>
         <div className="flex items-center gap-2 mt-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Settings2 className="h-4 w-4" /> General</Button>
            <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button>
         </div>
       </div>
    </div>
  );
}
