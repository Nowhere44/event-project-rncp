import React from 'react';

interface User {
    id: string;
    first_name: string;
    notificationCount?: number;
}

interface UserListProps {
    users: User[];
    currentUserId: string;
    onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onUserClick }) => {
    return (
        <div className="w-1/4 pr-4">
            <h2 className="text-xl font-bold mb-2">Users</h2>
            <ul>
                {users.filter(user => user.id !== currentUserId).map(user => (
                    <li
                        key={user.id}
                        onClick={() => onUserClick(user)}
                        className="cursor-pointer hover:text-blue-500 mb-2 flex justify-between items-center"
                    >
                        <span>{user.first_name}</span>
                        {user.notificationCount && user.notificationCount > 0 && (
                            <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                                {user.notificationCount}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;