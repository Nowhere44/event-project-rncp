'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProfileComponentProps {
    userId: string;
}

export default function ProfileComponent({ userId }: ProfileComponentProps) {
    const { data: session, update, status } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        image: '',
    });

    useEffect(() => {
        if (session?.user) {
            setUserData({
                firstName: session.user.firstName || '',
                lastName: session.user.lastName || '',
                email: session.user.email || '',
                image: session.user.image || '',
            });
        }
    }, [session]);

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
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    image: userData.image,
                }),
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
                const response = await fetch(`/api/user/${userId}`, {
                    method: 'DELETE',
                });

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

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Profil de {session.user.firstName}</h1>
            {isEditing ? (
                <div className="space-y-6">
                    <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Prénom"
                    />
                    <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nom"
                    />
                    <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Email"
                    />
                    <input
                        type="text"
                        value={userData.image || ''}
                        onChange={(e) => setUserData({ ...userData, image: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="URL de l'image de profil"
                    />
                    <button onClick={handleSave} className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300">Sauvegarder</button>
                </div>
            ) : (
                <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                        {session.user.image && (
                            <img src={session.user.image} alt="Profile" className="w-32 h-32 rounded-full mb-4" />
                        )}
                    </div>
                    <p className="text-xl"><strong>Nom:</strong> {session.user.lastName}</p>
                    <p className="text-xl"><strong>Prénom:</strong> {session.user.firstName}</p>
                    <p className="text-xl"><strong>Email:</strong> {session.user.email}</p>
                    <p className="text-xl"><strong>Role:</strong> {session.user.role}</p>
                </div>
            )}
            <div className="mt-8 flex justify-center space-x-4">
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
    );
}
