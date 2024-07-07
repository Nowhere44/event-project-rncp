import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface MessageItemProps {
    message: {
        id: string;
        content: string;
        type: 'text' | 'gif' | 'public';
        sender?: {
            id: string;
            first_name: string;
        };
        user?: {
            id: string;
            first_name: string;
        };
        senderId: string;
    };
    currentUserId: string;
    onDelete: (messageId: string) => void;
    onEdit: (messageId: string, newContent: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUserId, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const handleEdit = () => {
        if (editContent.trim() !== message.content) {
            onEdit(message.id, editContent);
        }
        setIsEditing(false);
    };

    const senderName = message.sender?.first_name || message.user?.first_name || "Unknown";
    const isOwnMessage = message.senderId === currentUserId;

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white'} rounded-lg p-3 shadow-sm`}>
                {!isOwnMessage && <p className="text-xs font-semibold mb-1">{senderName}</p>}
                {message.type === 'gif' ? (
                    <Image src={message.content} alt="GIF" className="max-w-full rounded" width={100} height={100} />
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
            {isOwnMessage && !isEditing && (
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