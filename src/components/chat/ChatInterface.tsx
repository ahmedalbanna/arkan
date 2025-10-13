'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Card } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useChatInterface } from '@/hooks';
import { cn } from '@/lib/utils';
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatList } from './ChatList';
import { ConversationView } from './ConversationView';

export default function ChatInterface() {
  const {
    agents,
    chats,
    selectedChat,
    handleSelectChat,
    handleSelectAgent,
  } = useChatInterface();

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 h-full">
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <Card variant="glass" className="h-full backdrop-blur-md shadow-soft">
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-headline font-semibold">AI Chat Interface</h1>
                  <p className="text-sm text-muted-foreground">Intelligent conversations with AI agents</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                  <Sparkles className="h-3 w-3" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>

            <div className="h-[calc(100%-80px)]">
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
                <ResizableHandle withHandle className="bg-border/50 hover:bg-border transition-colors" />
                <ResizablePanel defaultSize={75}>
                  <ConversationView chat={selectedChat} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
