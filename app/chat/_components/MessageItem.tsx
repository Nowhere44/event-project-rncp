import React, { useState } from 'react';

interface MessageItemProps {
    message: {
        id: string;
        content: string;
        type: 'text' | 'gif';
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
        <div className={`mb-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            <span className="font-bold">{senderName}:</span>
            {message.type === 'gif' ? (
                <div className="relative inline-block">
                    <img src={message.content} alt="GIF" className="max-w-xs mt-1" />
                    {isOwnMessage && (
                        <button onClick={() => onDelete(message.id)} className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded">
                            Delete
                        </button>
                    )}
                </div>
            ) : isEditing ? (
                <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={handleEdit}
                    onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                    className="ml-2 p-1 border rounded"
                    autoFocus
                />
            ) : (
                <>
                    <span className="ml-2">{message.content}</span>
                    {isOwnMessage && (
                        <>
                            <button onClick={() => onDelete(message.id)} className="ml-2 text-red-500">Delete</button>
                            <button onClick={() => setIsEditing(true)} className="ml-2 text-blue-500">Edit</button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default MessageItem;