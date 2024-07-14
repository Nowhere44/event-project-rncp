'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface MessageItemProps {
    message: {
        id: string;
        content: string;
        senderId: string;
        type: 'text' | 'gif' | 'public';
        sender: {
            id: string;
            first_name: string;
            profile_picture?: string;
            isVerified?: boolean;
        };
        createdAt: string;
        editableUntil: string;
    };
    currentUserId: string;
    onDelete: (messageId: string) => void;
    onEdit: (messageId: string, newContent: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUserId, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [canEditOrDelete, setCanEditOrDelete] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkEditability = () => {
            const now = new Date();
            const editableUntil = new Date(message.editableUntil);
            setCanEditOrDelete(now < editableUntil);
        };

        checkEditability();
        const timer = setInterval(checkEditability, 1000);

        return () => clearInterval(timer);
    }, [message.editableUntil]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleEdit = () => {
        if (editContent.trim() !== message.content) {
            onEdit(message.id, editContent);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(message.content);
        setIsEditing(false);
    };

    const isOwnMessage = message.senderId === currentUserId;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
        >
            {!isOwnMessage && (
                <div className="flex items-center -mr-8">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender.profile_picture} alt={message.sender.first_name} />
                    </Avatar>
                </div>
            )}
            <div className={`max-w-[70%] ${isOwnMessage ? 'bg-orange-500 text-white' : 'bg-gray-200'} rounded-lg p-3 shadow-sm`}>
                {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 flex items-center">
                        {message.sender.first_name}
                        {message.sender.isVerified && (
                            <CheckCircle className="h-3 w-3 text-orange-500 ml-1" />
                        )}
                    </p>
                )}
                {message.type === 'gif' ? (
                    <Image src={message.content} alt="GIF" width={200} height={200} className="max-w-full rounded" />
                ) : isEditing ? (
                    <div className="flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-1 border rounded text-black mr-2"
                        />
                        <Button onClick={handleEdit} variant="ghost" size="icon" className="h-6 w-6 text-green-500">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleCancel} variant="ghost" size="icon" className="h-6 w-6 text-red-500">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <p>{message.content}</p>
                )}
            </div>
            {isOwnMessage && !isEditing && canEditOrDelete && (
                <div className="ml-2 flex flex-col justify-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="h-6 w-6">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Modifier</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => onDelete(message.id)} variant="ghost" size="icon" className="h-6 w-6 text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Supprimer</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </motion.div>
    );
};

export default MessageItem;