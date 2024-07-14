'use client';

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface User {
    id: string;
    first_name: string;
    notificationCount?: number;
    profile_picture: string;
    isVerified?: boolean;
}

interface UserListProps {
    users: User[];
    currentUserId: string;
    onUserClick: (user: User) => void;
    isLoading: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onUserClick, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);

    useEffect(() => {
        setFilteredUsers(
            users.filter(
                user =>
                    user.id !== currentUserId &&
                    user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [users, searchTerm, currentUserId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white mt-16 sm:mt-0">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
                <div className="relative mt-2">
                    <Input
                        type="text"
                        placeholder="Rechercher un contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>
            <ScrollArea className="flex-grow">
                <AnimatePresence>
                    {filteredUsers.map(user => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => onUserClick(user)}
                            className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors duration-200"
                        >
                            <div className="relative">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user.profile_picture} alt={user.first_name} />
                                    <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                                </Avatar>
                                {user.isVerified && (
                                    <CheckCircle className="h-4 w-4 text-orange-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                                )}
                            </div>
                            <div className="flex-grow ml-3">
                                <p className="font-medium text-gray-800 flex items-center">
                                    {user.first_name}
                                </p>
                            </div>
                            {user.notificationCount && user.notificationCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {user.notificationCount}
                                </Badge>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </ScrollArea>
        </div>
    );
};

export default UserList;