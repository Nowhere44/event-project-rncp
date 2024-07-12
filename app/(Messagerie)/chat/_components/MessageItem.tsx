import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface MessageItemProps {
    message: {
        id: string;
        content: string;
        senderId: string;
        type: 'text' | 'gif' | 'public';
        sender: {
            id: string;
            first_name: string;
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

    const handleEdit = () => {
        if (editContent.trim() !== message.content) {
            onEdit(message.id, editContent);
        }
        setIsEditing(false);
    };

    const isOwnMessage = message.senderId === currentUserId;

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3 shadow-sm`}>
                {!isOwnMessage && <p className="text-xs font-semibold mb-1">{message.sender.first_name}</p>}
                {message.type === 'gif' ? (
                    <Image src={message.content} alt="GIF" width={200} height={200} className="max-w-full rounded" />
                ) : isEditing ? (
                    <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onBlur={handleEdit}
                        onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                        className="w-full p-1 border rounded text-black"
                        autoFocus
                    />
                ) : (
                    <p>{message.content}</p>
                )}
            </div>
            {isOwnMessage && !isEditing && canEditOrDelete && (
                <div className="ml-2 flex flex-col justify-center">
                    <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="h-6 w-6">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => onDelete(message.id)} variant="ghost" size="icon" className="h-6 w-6 text-red-500">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MessageItem;