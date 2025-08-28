
'use client';

import { ChatList } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { useChatInterface } from '@/hooks';

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
          agents={agents}
          liveChats={chats}
          selectedChat={selectedChat}
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
