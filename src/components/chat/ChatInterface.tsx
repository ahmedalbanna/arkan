
'use client';

import { ChatList } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { useChatInterface } from '@/hooks';
import { Agent } from '@/lib/models/agent';
import { Chat } from '@/lib/models/chat';

export default function ChatInterface() {
  const {
    agents,
    chats,
    selectedChat,
    handleSelectChat,
    handleSelectAgent,
  } = useChatInterface();

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
          agents={agents} // Pass agents directly
          liveChats={chats} // Already an array of Chat class instances
          selectedChat={selectedChat} // Already a Chat class instance or null
          onSelectChat={handleSelectChat}
          onSelectAgent={handleSelectAgent}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ConversationView
            chat={selectedChat}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
