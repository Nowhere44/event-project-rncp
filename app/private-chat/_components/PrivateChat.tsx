import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import MessageItem from '@/app/chat/_components/MessageItem';
import GifSearch from '@/app/chat/_components/GifSearch';

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

        if (socket) {
            socket.on('privateMessage', (message: PrivateMessage) => {
                if (message.senderId === otherUserId || message.receiverId === otherUserId) {
                    setMessages(prevMessages => [...prevMessages, message]);
                }
            });

            socket.on('deletePrivateMessage', (messageId: string) => {
                setMessages(prev => prev.filter(msg => msg.id !== messageId));
            });

            socket.on('editPrivateMessage', (editedMessage: PrivateMessage) => {
                setMessages(prev => prev.map(msg => msg.id === editedMessage.id ? editedMessage : msg));
            });

            return () => {
                socket.off('privateMessage');
                socket.off('deletePrivateMessage');
                socket.off('editPrivateMessage');
            };
        }
    }, [otherUserId, socket]);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-2/3 h-3/4 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Chat with {otherUserName}</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
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
                <form onSubmit={sendMessage} className="p-4 border-t flex">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-grow mr-2 p-2 border rounded"
                        placeholder="Type your message..."
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Send</button>
                    <button type="button" onClick={() => setShowGifSearch(!showGifSearch)} className="bg-green-500 text-white px-4 py-2 rounded">
                        GIF
                    </button>
                </form>
                {showGifSearch && (
                    <div className="p-4 border-t">
                        <GifSearch onSend={sendGif} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivateChat;