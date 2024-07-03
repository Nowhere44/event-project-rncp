'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IUser } from '@/types';

interface ProfileComponentProps {
    userId: string;
    userData: IUser | null;
}

export default function ProfileComponent({ userId, userData }: ProfileComponentProps) {
    const { data: session, update, status } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUserData, setEditedUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        image: '',
    });

    useEffect(() => {
        if (userData) {
            setEditedUserData({
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                email: userData.email || '',
                image: userData.profile_picture || '',
            });
        }
    }, [userData]);

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    if (!session?.user) {
        return null;
    }

    const handleEdit = () => {
        setIsEditing(true);
    }

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedUserData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        firstName: updatedUser.first_name,
                        lastName: updatedUser.last_name,
                        email: updatedUser.email,
                        image: updatedUser.profile_picture,
                    }
                });
                setIsEditing(false);
                router.refresh();
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            try {
                const response = await fetch(`/api/user/${userId}`, { method: 'DELETE' });
                if (response.ok) {
                    await signOut({ callbackUrl: '/' });
                } else {
                    console.error('Failed to delete account');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    if (!session?.user || !userData) {
        return null;
    }

    console.log('userData:', userData);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 lg:p-12 max-w-3xl mx-auto mt-12">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Profil de {session.user.firstName}</h1>
            <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-4">
                    {session.user.image && (
                        <img src={session.user.image} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-md" />
                    )}
                </div>
                {isEditing ? (
                    <div className="space-y-4 w-full">
                        {['firstName', 'lastName', 'email', 'image'].map((field) => (
                            <input
                                key={field}
                                type={field === 'email' ? 'email' : 'text'}
                                value={editedUserData[field as keyof typeof editedUserData]}
                                onChange={(e) => setEditedUserData({ ...editedUserData, [field]: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            />
                        ))}
                        <button onClick={handleSave} className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300">
                            Sauvegarder
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 text-center w-full">
                        {['lastName', 'firstName', 'email'].map((field) => (
                            <p key={field} className="text-xl">
                                <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {session.user[field as keyof typeof session.user]}
                            </p>
                        ))}
                        {userData && userData.totalRevenue && Number(userData.totalRevenue) > 0 && (
                            <p className="text-xl"><strong>Revenu total:</strong> {Number(userData.totalRevenue).toFixed(2)} €</p>
                        )}
                    </div>
                )}
                <div className="mt-8 flex justify-center space-x-4 w-full">
                    {!isEditing && (
                        <button onClick={handleEdit} className="py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
                            Modifier le profil
                        </button>
                    )}
                    <button onClick={handleDelete} className="py-3 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
                        Supprimer le compte
                    </button>
                </div>
            </div>
        </div>
    );
}
