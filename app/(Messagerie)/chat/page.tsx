'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher';
import { Smile, Menu, Send } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageItem from './_components/MessageItem';
import UserList from './_components/UserList';
import GifSearch from './_components/GifSearch';
import PrivateChat from '../../private-chat/_components/PrivateChat';


interface Message {
    id: string;
    content: string;
    senderId: string;
    type: 'text' | 'gif' | 'public';
    sender: {
        id: string;
        first_name: string;
        isVerified: boolean;
    };
    createdAt: string;
    editableUntil: string;
}

interface User {
    id: string;
    first_name: string;
    profile_picture: string;
    isVerified?: boolean;
}

const ChatPage = () => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showGifSearch, setShowGifSearch] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [userNotifications, setUserNotifications] = useState<{ [key: string]: number }>({});
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleNewMessage = useCallback((message: Message) => {
        setMessages((prev) => {
            const messageExists = prev.some(m => m.id === message.id);
            if (messageExists) return prev;
            return [...prev, message];
        });
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            fetchUsers();
            fetchMessages();
            const channel = pusherClient.subscribe('chat');
            channel.bind('message', handleNewMessage);
            channel.bind('deleteMessage', handleDeleteMessage);
            channel.bind('editMessage', handleEditMessage);

            return () => {
                pusherClient.unsubscribe('chat');
            };
        }
    }, [session, handleNewMessage]);

    const handleDeleteMessage = useCallback((messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, []);

    const handleEditMessage = useCallback((editedMessage: Message) => {
        setMessages(prev => prev.map(msg =>
            msg.id === editedMessage.id ? editedMessage : msg
        ));
    }, []);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        const response = await fetch('/api/users');
        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
        setIsLoadingUsers(false);
    };

    const fetchMessages = async () => {
        const response = await fetch('/api/public-messages/');
        if (response.ok) {
            const data = await response.json();
            setMessages(data.map((message: any) => ({
                ...message,
                senderId: message.userId,
                sender: message.user,
                type: message.type || 'text',
            })));
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !session?.user?.id) return;
        const newMessage = {
            content: inputValue,
            senderId: session.user.id,
            type: 'text' as const,
            sender: {
                id: session.user.id,
                first_name: session.user.firstName || ''
            },
        };
        setInputValue('');
        setSuggestions([]);

        try {
            const response = await fetch('/api/public-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            const response = await fetch(`/api/public-messages/${messageId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const editMessage = async (messageId: string, newContent: string) => {
        try {
            const response = await fetch(`/api/public-messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent }),
            });
            if (!response.ok) {
                throw new Error('Failed to edit message');
            }
        } catch (error) {
            console.error('Error editing message:', error);
        }
    };

    const sendGif = async (gifUrl: string) => {
        if (!session?.user?.id) return;

        const newMessage = {
            content: gifUrl,
            senderId: session.user.id,
            type: 'gif' as const,
        };

        setShowGifSearch(false);

        try {
            const response = await fetch('/api/public-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });
            if (!response.ok) {
                throw new Error('Failed to send GIF');
            }
        } catch (error) {
            console.error('Error sending GIF:', error);
        }
    };

    const startPrivateChat = (user: User) => {
        setSelectedUser(user);
        setUserNotifications(prev => ({ ...prev, [user.id]: 0 }));
        setIsSidebarOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.includes('@')) {
            const lastWord = value.split(' ').pop() || '';
            if (lastWord.startsWith('@')) {
                const searchTerm = lastWord.slice(1);
                const matches = users.filter(user =>
                    user.id !== session?.user?.id &&
                    user.first_name.toLowerCase().startsWith(searchTerm.toLowerCase())
                );
                setSuggestions(matches);
            } else {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = (user: User) => {
        const words = inputValue.split(' ');
        words[words.length - 1] = `@${user.first_name}`;
        setInputValue(words.join(' ') + ' ');
        setSuggestions([]);
    };

    if (!session) return <div className='h-full flex items-center justify-center text-orange-500'>Please sign in to access the chat.</div>;

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Sidebar pour desktop */}
            <div className="hidden md:flex w-1/4 bg-white border-r border-gray-200 flex-col">
                <UserList
                    users={users.map(user => ({
                        ...user,
                        notificationCount: userNotifications[user.id] || 0
                    }))}
                    currentUserId={session.user.id}
                    onUserClick={startPrivateChat}
                    isLoading={isLoadingUsers}
                />
            </div>

            {/* Zone de chat principale */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-4/5 p-0">
                            <UserList
                                users={users.map(user => ({
                                    ...user,
                                    notificationCount: userNotifications[user.id] || 0
                                }))}
                                currentUserId={session.user.id}
                                onUserClick={startPrivateChat}
                                isLoading={isLoadingUsers}
                            />
                        </SheetContent>
                    </Sheet>
                    <h1 className="text-xl font-semibold">{`L'Agora`}</h1>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {messages.map((message) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                currentUserId={session.user.id}
                                onDelete={deleteMessage}
                                onEdit={editMessage}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                <div className="bg-white border-t border-gray-200 p-4">
                    <form onSubmit={sendMessage} className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowGifSearch(!showGifSearch)}
                        >
                            <Smile className="h-5 w-5" />
                        </Button>
                        <div className="w-full">
                            <Input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Type a message"
                            />
                        </div>
                        <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                    {showGifSearch && (
                        <div className="mt-2">
                            <GifSearch onSend={sendGif} onClose={() => setShowGifSearch(false)} />
                        </div>
                    )}
                    {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border shadow-lg mt-1">
                            {suggestions.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleSuggestionSelect(user)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {user.first_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedUser && (
                <PrivateChat
                    currentUserId={session.user.id}
                    otherUserId={selectedUser.id}
                    otherUserName={selectedUser.first_name}
                    onClose={() => setSelectedUser(null)}
                    otherUserProfilePicture={selectedUser.profile_picture}
                    isVerified={selectedUser.isVerified}
                />
            )}
        </div>
    );
};

export default ChatPage;