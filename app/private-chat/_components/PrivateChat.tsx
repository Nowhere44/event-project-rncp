import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pusherClient } from '@/lib/pusher';
import MessageItem from '@/app/(Messagerie)/chat/_components/MessageItem';
import GifSearch from '@/app/(Messagerie)/chat/_components/GifSearch';
import { Send, Smile, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PrivateMessage {
    id: string;
    content: string;
    type: 'text' | 'gif';
    senderId: string;
    receiverId: string;
    sender: {
        id: string;
        first_name: string;
    };
    createdAt: string;
    editableUntil: string;
}

interface PrivateChatProps {
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
    onClose: () => void;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ currentUserId, otherUserId, otherUserName, onClose }) => {
    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showGifSearch, setShowGifSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchPrivateMessages = async () => {
        try {
            const response = await fetch(`/api/private-messages?otherUserId=${otherUserId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            } else {
                console.error('Error fetching private messages:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching private messages:', error);
        }
    };


    const handleNewMessage = useCallback((message: PrivateMessage) => {
        if (message.senderId === otherUserId || message.receiverId === otherUserId) {
            setMessages(prevMessages => [...prevMessages, message]);
        }
    }, [otherUserId]);

    useEffect(() => {
        fetchPrivateMessages();
        const channel = pusherClient.subscribe(`private-${currentUserId}`);
        channel.bind('privateMessage', handleNewMessage);
        channel.bind('deletePrivateMessage', handleDeleteMessage);
        channel.bind('editPrivateMessage', handleEditMessage);

        return () => {
            pusherClient.unsubscribe(`private-${currentUserId}`);
        };
    }, [currentUserId, otherUserId, handleNewMessage]);

    const handleDeleteMessage = (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleEditMessage = (editedMessage: PrivateMessage) => {
        setMessages(prev => prev.map(msg => msg.id === editedMessage.id ? editedMessage : msg));
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const now = new Date();
        const editableUntil = new Date(now.getTime() + 30 * 1000);

        const newMessage: PrivateMessage = {
            content: inputValue,
            type: 'text',
            senderId: currentUserId,
            receiverId: otherUserId,
            id: 'temp-' + Date.now(),
            sender: { id: currentUserId, first_name: session?.user?.firstName || '' },
            createdAt: now.toISOString(),
            editableUntil: editableUntil.toISOString()
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputValue('');

        try {
            const response = await fetch('/api/private-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            const savedMessage = await response.json();
            setMessages(prev => prev.map(msg =>
                msg.id === newMessage.id ? savedMessage : msg
            ));
        } catch (error) {
            console.error('Error sending private message:', error);
            setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            const response = await fetch(`/api/private-messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: otherUserId }),
            });
            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
            // La suppression locale du message est gérée par le gestionnaire d'événements Pusher
        } catch (error) {
            console.error('Error deleting private message:', error);
        }
    };

    const editMessage = async (messageId: string, newContent: string) => {
        try {
            const response = await fetch(`/api/private-messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent, receiverId: otherUserId }),
            });
            if (!response.ok) {
                throw new Error('Failed to edit message');
            }
            // La modification locale du message est gérée par le gestionnaire d'événements Pusher
        } catch (error) {
            console.error('Error editing private message:', error);
        }
    };

    const sendGif = async (gifUrl: string) => {
        const now = new Date();
        const editableUntil = new Date(now.getTime() + 30 * 1000);

        const newMessage: PrivateMessage = {
            content: gifUrl,
            type: 'gif',
            senderId: currentUserId,
            receiverId: otherUserId,
            id: 'temp-' + Date.now(),
            sender: { id: currentUserId, first_name: session?.user?.firstName || '' },
            createdAt: now.toISOString(),
            editableUntil: editableUntil.toISOString()
        };
        setMessages(prev => [...prev, newMessage]);

        try {
            const response = await fetch('/api/private-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });
            if (!response.ok) {
                throw new Error('Failed to send GIF');
            }
            const savedMessage = await response.json();
            setMessages(prev => prev.map(msg =>
                msg.id === newMessage.id ? savedMessage : msg
            ));
            setShowGifSearch(false);
        } catch (error) {
            console.error('Error sending GIF:', error);
            setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="fixed inset-0 z-[1007] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl h-[90vh] flex flex-col shadow-xl">
                <div className="p-4 border-b flex justify-between items-center bg-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">{otherUserName}</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            currentUserId={currentUserId}
                            onDelete={deleteMessage}
                            onEdit={editMessage}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t">
                    <form onSubmit={sendMessage} className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowGifSearch(!showGifSearch)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Smile size={24} />
                        </button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                            placeholder="Type a message..."
                        />
                        <button type="submit" className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                            <Send size={24} />
                        </button>
                    </form>
                    {showGifSearch && (
                        <div className="mt-2">
                            <GifSearch onSend={sendGif} onClose={() => setShowGifSearch(false)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateChat;