
'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatSession } from './ChatList';
import { Button } from '../ui/button';
import { Plus, MessageSquare, Edit2, RotateCcw, Expand, X, Bot, User, Send, Paperclip, Info, Settings2, Loader2 } from 'lucide-react';
import { CardHeader } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDatabase, ref, push, onValue, off } from 'firebase/database';
import { app } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { useChatStore } from '@/hooks/useChatStore';

interface ConversationViewProps {
  chat: ChatSession | null;
}

function Message({ role, content }: { role: 'user' | 'assistant', content: string }) {
    const isUser = role === 'user';
    return (
        <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
            {!isUser && (
                 <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5"/>
                </div>
            )}
            <div className={cn("p-3 rounded-lg max-w-lg", isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="text-sm">{content}</p>
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
  const { firebaseUser } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const addMessageToStore = useChatStore(state => state.addMessage);
  
  useEffect(() => {
    if (!chat || chat.isTemporary) {
      setMessages(chat?.messages || []);
      return;
    };

    const db = getDatabase(app);
    const messagesRef = ref(db, `messages/${chat.id}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const messagesList = data ? Object.values(data) : [];
        setMessages(messagesList as any[]);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !firebaseUser || !chat) return;

    const messageData = {
      senderId: firebaseUser.uid,
      content: input,
      timestamp: new Date().toISOString(),
      role: 'user', // In a real app, this might be 'admin'
    };

    const db = getDatabase(app);
    try {
        await push(ref(db, `messages/${chat.id}`), messageData);
        setInput('');
        addMessageToStore(chat.id, messageData as any);
    } catch(err) {
        toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  }


  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-8">
        <div className="text-center">
            <h2 className="text-2xl font-semibold">Start a conversation</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">
                Select a chat from the sidebar or start a new one to begin.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">{chat.title}</h2>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Expand className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
            {messages.map((msg, index) => (
                <Message key={index} role={msg.senderId === firebaseUser?.uid ? 'user' : 'assistant'} content={msg.content} />
            ))}
        </div>
      </ScrollArea>
       
       <div className="p-4 border-t bg-background">
         <form onSubmit={handleSendMessage}>
            <div className="relative">
                <Textarea
                    placeholder="Ask me anything..."
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
                />
                <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground">
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
