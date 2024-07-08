import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

interface User {
    id: string;
    first_name: string;
    notificationCount?: number;
    profile_picture: string;
}

interface UserListProps {
    users: User[];
    currentUserId: string;
    onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onUserClick }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Contacts</h2>
            </div>
            <ScrollArea className="flex-grow">
                {users.filter(user => user.id !== currentUserId).map(user => (
                    <div
                        key={user.id}
                        onClick={() => onUserClick(user)}
                        className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <Image src={user.profile_picture || ""} alt="profile-picture" width={
                                40
                            } height={40}
                            />
                        </div>
                        <div className="flex-grow">
                            <p className="font-medium">{user.first_name}</p>
                        </div>
                        {user.notificationCount && user.notificationCount > 0 && (
                            <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                                {user.notificationCount}
                            </span>
                        )}
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
};

export default UserList;

