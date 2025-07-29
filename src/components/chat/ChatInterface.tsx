
'use client';

import { useState, useEffect } from 'react';
import { ChatList, type ChatSession } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { createConversationApi } from '@/services/chat-service';

export default function ChatInterface() {
  const { selectedChat, setSelectedChat, createConversation, chats, isInitialized, initialize } = useChatStore();
  const searchParams = useSearchParams();
  const { firebaseUser, userProfile } = useAuth();
  
  // Initialize the store with server data once user is available
  useEffect(() => {
    if (firebaseUser && !isInitialized) {
        initialize(firebaseUser);
    }
  }, [firebaseUser, isInitialized, initialize]);


  useEffect(() => {
    // This effect can be adapted to deep links into specific conversations if needed
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      const existingChat = chats.find(c => c.id === conversationId);
      if (existingChat) {
        setSelectedChat(existingChat);
      }
    }
  }, [searchParams, chats, setSelectedChat]);

  const handleCreateNewChat = async () => {
    if (!firebaseUser || !userProfile) return;
    // This logic is simplified; a real app would have a user selection modal
    const targetUserId = prompt("Enter User ID to chat with:");
    if (!targetUserId) return;
    
    try {
        const token = await firebaseUser.getIdToken();
        const conversation = await createConversationApi({
            participantIds: [firebaseUser.uid, targetUserId],
            participantNames: {
                [firebaseUser.uid]: userProfile.name || 'Admin',
                [targetUserId]: 'User' // In a real app, fetch the user's name
            },
            title: `Chat with User ${targetUserId.slice(0,6)}`
        }, token);
        createConversation(conversation);
    } catch(error: any) {
        toast({title: "Error", description: `Failed to create chat: ${error.message}`, variant: "destructive"})
    }

  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full items-stretch"
    >
      <ResizablePanel
        defaultSize={25}
        minSize={20}
        maxSize={30}
        className={cn("min-w-[250px] max-w-[400px]")}
      >
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onNewChat={handleCreateNewChat}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ConversationView chat={selectedChat} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
