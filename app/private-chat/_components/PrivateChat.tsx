'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pusherClient } from '@/lib/pusher';
import MessageItem from '@/app/(Messagerie)/chat/_components/MessageItem';
import GifSearch from '@/app/(Messagerie)/chat/_components/GifSearch';
import { useSession } from 'next-auth/react';
import { Send, Smile, X, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle } from 'lucide-react';

interface PrivateMessage {
    id: string;
    content: string;
    type: 'text' | 'gif';
    senderId: string;
    receiverId: string;
    sender: {
        id: string;
        first_name: string;
        profile_picture?: string;
        isVerified?: boolean;
    };
    createdAt: string;
    editableUntil: string;
}

interface PrivateChatProps {
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserProfilePicture?: string;
    onClose: () => void;
    isVerified?: boolean;
}

const PrivateChat: React.FC<PrivateChatProps> = ({
    currentUserId,
    otherUserId,
    otherUserName,
    otherUserProfilePicture,
    onClose,
    isVerified
}) => {
    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showGifSearch, setShowGifSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const fetchPrivateMessages = useCallback(async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    }, [otherUserId]);

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
    }, [currentUserId, otherUserId, handleNewMessage, fetchPrivateMessages]);

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

    const chatContent = (
        <>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            currentUserId={currentUserId}
                            onDelete={deleteMessage}
                            onEdit={editMessage}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                    <Button
                        type="button"
                        onClick={() => setShowGifSearch(!showGifSearch)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Smile className="h-6 w-6" />
                    </Button>
                    <div className='w-full'>
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}

                            placeholder="Tapez un message..."
                        /></div>

                    <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
                {showGifSearch && (
                    <div className="mt-2">
                        <GifSearch onSend={sendGif} onClose={() => setShowGifSearch(false)} />
                    </div>
                )}
            </div>
        </>
    );

    // Version mobile
    if (typeof window !== 'undefined' && window.innerWidth < 100) {
        return (
            <Sheet open={true} onOpenChange={onClose}>
                <SheetContent side="right" className="w-full p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle className="flex items-center">
                            <Button onClick={onClose} variant="ghost" size="icon" className="mr-2">
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                            <Avatar className="h-8 w-8 mr-2">
                            </Avatar>
                            {otherUserName}
                        </SheetTitle>
                    </SheetHeader>
                    {chatContent}
                </SheetContent>
            </Sheet>
        );
    }

    // Version desktop
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 mt-16">
            <div className="bg-white rounded-lg w-full max-w-2xl h-[75vh] flex flex-col shadow-xl">
                <div className="p-4 border-b flex justify-between items-center bg-gray-100">

                    <div className='flex gap-2 items-center'>
                        <div className="relative">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={otherUserProfilePicture} />
                            </Avatar>
                            {isVerified && (
                                <CheckCircle className="h-4 w-4 text-orange-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{otherUserName}</h2>
                    </div>

                    <Button onClick={onClose} variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                {chatContent}
            </div>
        </div>
    );
};

export default PrivateChat;