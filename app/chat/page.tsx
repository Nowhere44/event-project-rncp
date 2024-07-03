'use client'

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';
import MessageItem from './_components/MessageItem';
import UserList from './_components/UserList';
import GifSearch from './_components/GifSearch';
import { useRouter } from 'next/navigation';
import PrivateChat from '../private-chat/_components/PrivateChat'

interface Message {
    id: string;
    content: string;
    senderId: string;
    type: 'text' | 'gif';
    sender: {
        id: string;
        first_name: string;
    };
    createdAt: string;
}

interface User {
    id: string;
    first_name: string;
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
    const router = useRouter();

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
        const response = await fetch('/api/messages');
        if (response.ok) {
            const data = await response.json();
            setMessages(data.map((message: any) => ({
                ...message,
                sender: message.user,
                senderId: message.userId,
            })));
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !socketRef.current || !session?.user?.id) return;

        const newMessage: Partial<Message> = {
            content: inputValue,
            senderId: session.user.id,
            type: 'text',
        };

        console.log("Sending message:", newMessage); // Pour le débogage
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Chat Room</h1>
            <div className="flex">
                <UserList
                    users={users.map(user => ({
                        ...user,
                        notificationCount: userNotifications[user.id] || 0
                    }))}
                    currentUserId={session.user.id}
                    onUserClick={startPrivateChat}
                />
                <div className="w-3/4">
                    <div className="bg-white shadow-md rounded p-4 mb-4 h-96 overflow-y-auto">
                        {messages.map((message) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                currentUserId={session.user.id}
                                onDelete={deleteMessage}
                                onEdit={editMessage}
                            />
                        ))}
                    </div>
                    <form onSubmit={sendMessage} className="flex relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            className="flex-grow mr-2 p-2 border rounded"
                            placeholder="Type your message..."
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute bottom-full left-0 bg-white border rounded">
                                {suggestions.map(user => (
                                    <li
                                        key={user.id}
                                        onClick={() => handleSuggestionSelect(user)}
                                        className="cursor-pointer p-2 hover:bg-gray-100"
                                    >
                                        {user.first_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Send</button>
                        <button type="button" onClick={() => setShowGifSearch(!showGifSearch)} className="bg-green-500 text-white px-4 py-2 rounded">
                            GIF
                        </button>
                    </form>
                    {showGifSearch && (
                        <GifSearch onSend={sendGif} />
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