
'use client';

import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Edit2, MessageSquare, Inbox, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useDeleteChat } from '@/hooks/use-chat';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/hooks/useChatStore';
import { useState } from 'react';
import { useUsers } from '@/hooks/use-user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { createConversationApi } from '@/services/chat-service';
import { toast } from '@/hooks/use-toast';
import type { ChatSession } from '@/hooks/useChatStore';

interface ChatListProps {
  chats: ChatSession[];
  selectedChat: ChatSession | null;
  onSelectChat: (chat: ChatSession) => void;
}


function NewChatDialog() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { createConversation } = useChatStore();
  const [isCreating, setIsCreating] = useState(false);
  const { firebaseUser, userProfile: adminProfile } = useAuth();

  const handleCreateChat = async () => {
    if (!selectedUser || !firebaseUser || !adminProfile) return;
    setIsCreating(true);
    try {
        const token = await firebaseUser.getIdToken();
        const conversation = await createConversationApi({
            participantIds: [firebaseUser.uid, selectedUser.id],
            participantNames: {
                [firebaseUser.uid]: adminProfile.name,
                [selectedUser.id]: selectedUser.name
            },
            title: `Chat with ${selectedUser.name}`
        }, token);
        createConversation(conversation);
        setOpen(false);
        setSelectedUser(null);
    } catch (error: any) {
        toast({ title: 'Error', description: `Failed to create chat: ${error.message}`, variant: 'destructive' });
    } finally {
        setIsCreating(false);
    }
  }
  
  return (
      <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
              </Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
              </DialogHeader>
              <Command>
                <CommandInput placeholder="Search for a user..." />
                <CommandList>
                  <CommandEmpty>{isLoadingUsers ? "Loading..." : "No users found."}</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => {
                          setSelectedUser(user);
                          handleCreateChat();
                        }}
                        className="flex items-center gap-2"
                      >
                         <Avatar className="h-6 w-6">
                            <AvatarImage src={user.profilePictureUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
            </Command>
            {isCreating && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <p>Creating chat...</p>
                </div>
            )}
          </DialogContent>
      </Dialog>
  );
}


export function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  const deleteChatMutation = useDeleteChat();
  const { userProfile } = useAuth();

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent the chat from being selected
    deleteChatMutation.mutate(chatId);
  }

  // Group chats by date
  const groupedChats = chats.reduce((groups, chat) => {
    // Don't show temporary chats in the admin list
    if (chat.isTemporary) return groups;

    const date = format(new Date(chat.lastMessageTimestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(chat);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  const sortedDates = Object.keys(groupedChats).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  return (
    <div className="flex h-full flex-col bg-muted/50">
      <div className="flex items-center justify-between p-4 border-b">
         <Tabs defaultValue="chats">
            <TabsList>
                <TabsTrigger value="chats" className="gap-2"><MessageSquare className="h-4 w-4" /> Chats</TabsTrigger>
                <TabsTrigger value="inbox" disabled><Inbox className="h-4 w-4" /> Inbox</TabsTrigger>
            </TabsList>
         </Tabs>
         {userProfile?.role === 'admin' && <NewChatDialog />}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sortedDates.map(date => (
          <div key={date}>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </div>
             <nav className="grid gap-1">
                {groupedChats[date].map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={cn(
                            'group flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent',
                            selectedChat?.id === chat.id && 'bg-accent'
                        )}
                    >
                         <div className="flex w-full items-center">
                            <div className="font-semibold">{chat.title}</div>
                            <div className="ml-auto text-xs text-muted-foreground">
                                {format(new Date(chat.lastMessageTimestamp), 'p')}
                            </div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()} // Prevent card click
                                  >
                                    {deleteChatMutation.isPending && deleteChatMutation.variables === chat.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the chat conversation for all participants.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={(e) => handleDeleteChat(e, chat.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </button>
                ))}
             </nav>
          </div>
        ))}
        {chats.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-8">
                <p>No chats yet.</p>
            </div>
        )}
      </div>
    </div>
  );
}
