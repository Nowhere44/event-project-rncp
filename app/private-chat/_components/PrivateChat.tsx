import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import MessageItem from '@/app/(Messagerie)/chat/_components/MessageItem';
import GifSearch from '@/app/(Messagerie)/chat/_components/GifSearch';
import { Send, Smile, X } from 'lucide-react';

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
}

interface PrivateChatProps {
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
    socket: Socket | null;
    onClose: () => void;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ currentUserId, otherUserId, otherUserName, socket, onClose }) => {
    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showGifSearch, setShowGifSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPrivateMessages();
        setupSocketListeners();
        return () => removeSocketListeners();
    }, [otherUserId, socket]);

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

    const setupSocketListeners = () => {
        if (socket) {
            socket.on('privateMessage', handleNewMessage);
            socket.on('deletePrivateMessage', handleDeleteMessage);
            socket.on('editPrivateMessage', handleEditMessage);
        }
    };

    const removeSocketListeners = () => {
        if (socket) {
            socket.off('privateMessage', handleNewMessage);
            socket.off('deletePrivateMessage', handleDeleteMessage);
            socket.off('editPrivateMessage', handleEditMessage);
        }
    };

    const handleNewMessage = (message: PrivateMessage) => {
        if (message.senderId === otherUserId || message.receiverId === otherUserId) {
            setMessages(prevMessages => [...prevMessages, message]);
        }
    };

    const handleDeleteMessage = (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleEditMessage = (editedMessage: PrivateMessage) => {
        setMessages(prev => prev.map(msg => msg.id === editedMessage.id ? editedMessage : msg));
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !socket) return;

        const newMessage = {
            content: inputValue,
            type: 'text' as const,
            senderId: currentUserId,
            receiverId: otherUserId,
        };

        socket.emit('privateMessage', newMessage);
        setInputValue('');
    };

    const deleteMessage = (messageId: string) => {
        socket?.emit('deletePrivateMessage', { messageId, receiverId: otherUserId });
    };

    const editMessage = (messageId: string, newContent: string) => {
        socket?.emit('editPrivateMessage', { id: messageId, content: newContent, receiverId: otherUserId });
    };

    const sendGif = (gifUrl: string) => {
        if (socket) {
            const newMessage = {
                content: gifUrl,
                type: 'gif' as const,
                senderId: currentUserId,
                receiverId: otherUserId,
            };

            socket.emit('privateMessage', newMessage);
            setShowGifSearch(false);
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