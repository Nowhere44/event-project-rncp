'use client'
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';
import { Smile, Menu } from 'lucide-react';
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
    };
    createdAt: string;
}

interface User {
    id: string;
    first_name: string;
    profile_picture: string;
}

const ChatPage = () => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showGifSearch, setShowGifSearch] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const [userNotifications, setUserNotifications] = useState<{ [key: string]: number }>({});
    const messagesEndRef = useRef<null | HTMLDivElement>(null);


    useEffect(() => {
        if (session?.user?.id && !socketRef.current) {
            fetchUsers();
            fetchMessages();
            initSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [session]);

    const initSocket = () => {
        if (socketRef.current) return;

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
            path: '/api/socketio',
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to Socket.IO server');
            socketRef.current?.emit('register', session?.user?.id);
        });

        socketRef.current.on('message', (message: Message) => {
            console.log("Received message:", message);
            setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('deleteMessage', (messageId: string) => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        });

        socketRef.current.on('editMessage', (editedMessage: Message) => {
            setMessages(prev => prev.map(msg => msg.id === editedMessage.id ? editedMessage : msg));
        });

        socketRef.current.on('privateMessage', (message: any) => {
            if (message.senderId !== session?.user?.id) {
                setUserNotifications(prev => ({
                    ...prev,
                    [message.senderId]: (prev[message.senderId] || 0) + 1
                }));
            }
        });
    };



    const fetchUsers = async () => {
        const response = await fetch('/api/users');
        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
    };

    const fetchMessages = async () => {
        const response = await fetch('/api/public-messages/');
        console.log("Fetching messages:", response);
        if (response.ok) {
            const data = await response.json();
            setMessages(data.map((message: any) => ({
                ...message,
                sender: message.user,
                senderId: message.userId,
                type: message.type,
            })));
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchMessages();
        }
    }, [session]);


    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !socketRef.current || !session?.user?.id) return;

        const newMessage: Partial<Message> = {
            content: inputValue,
            senderId: session.user.id,
            type: 'text',
        };

        console.log("Sending message:", newMessage);
        socketRef.current.emit('message', newMessage);
        setInputValue('');
        setSuggestions([]);
    };

    const deleteMessage = (messageId: string) => {
        socketRef.current?.emit('deleteMessage', messageId);
    };

    const editMessage = (messageId: string, newContent: string) => {
        socketRef.current?.emit('editMessage', { id: messageId, content: newContent });
    };

    const sendGif = (gifUrl: string) => {
        if (socketRef.current && session?.user?.id) {
            const gifMessage: Partial<Message> = {
                content: gifUrl,
                senderId: session.user.id,
                type: 'gif',
            };
            socketRef.current.emit('message', gifMessage);
        }
        setShowGifSearch(false);
    };

    const startPrivateChat = (user: User) => {
        setSelectedUser(user);
        setUserNotifications(prev => ({ ...prev, [user.id]: 0 }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.includes('@')) {
            const lastWord = value.split(' ').pop() || '';
            if (lastWord.startsWith('@')) {
                const searchTerm = lastWord.slice(1);
                const matches = users.filter(user =>
                    user.id !== session?.user.id && // Exclure l'utilisateur actuel
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

    if (!session) return <div>Please sign in to access the chat.</div>;

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
                />
            </div>

            {/* Zone de chat principale */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <Sheet>
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
                                onUserClick={(user) => {
                                    setSelectedUser(user);
                                }}
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

                        <Button type="submit">Send</Button>
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
                    socket={socketRef.current}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default ChatPage;