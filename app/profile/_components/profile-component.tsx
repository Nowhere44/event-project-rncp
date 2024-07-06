// app/profile/_components/profile-component.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IUser } from '@/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

    if (status === 'loading' || !session?.user || !userData) {
        return null;
    }

    const handleEdit = () => setIsEditing(true);

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
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
                const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
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
        <Card className="w-full max-w-sm mx-auto">
            <CardContent className="flex flex-col items-center pt-6">
                <Avatar className="w-24 h-24 border-4 border-white z-10 mb-4">
                    <AvatarImage src={session.user.image || ""} alt="Profile" />
                    <AvatarFallback>{session.user.firstName?.[0]}{session.user.lastName?.[0]}</AvatarFallback>
                </Avatar>
                {isEditing ? (
                    <Input
                        type="text"
                        value={editedUserData.image}
                        onChange={(e) => setEditedUserData({ ...editedUserData, image: e.target.value })}
                        placeholder="URL de l'image"
                        className="mb-2"
                    />
                ) : null}
                <h2 className="text-2xl font-bold text-center">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={editedUserData.firstName}
                                onChange={(e) => setEditedUserData({ ...editedUserData, firstName: e.target.value })}
                                placeholder="Prénom"
                            />
                            <Input
                                type="text"
                                value={editedUserData.lastName}
                                onChange={(e) => setEditedUserData({ ...editedUserData, lastName: e.target.value })}
                                placeholder="Nom"
                            />
                        </div>
                    ) : (
                        `${session.user.firstName} ${session.user.lastName}`
                    )}
                </h2>
                <p className="text-gray-600 text-center">{userData.role || 'Utilisateur'}</p>

                {isEditing ? (
                    <Input
                        type="email"
                        value={editedUserData.email}
                        onChange={(e) => setEditedUserData({ ...editedUserData, email: e.target.value })}
                        placeholder="Email"
                        className="mt-2"
                    />
                ) : (
                    <p className="text-gray-600 text-center">{session.user.email}</p>
                )}

                {userData && userData.totalRevenue && Number(userData.totalRevenue) > 0 && (
                    <p className="mt-4 font-semibold">Revenu total: {Number(userData.totalRevenue).toFixed(2)} €</p>
                )}

                <div className="flex space-x-2 w-full mt-6">
                    {isEditing ? (
                        <Button onClick={handleSave} className="flex-1">Sauvegarder</Button>
                    ) : (
                        <Button onClick={handleEdit} className="flex-1">
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Modifier
                        </Button>
                    )}
                    <Button onClick={handleDelete} variant="destructive" className="flex-1">
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Supprimer
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}