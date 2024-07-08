'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { IUser } from '@/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const userSchema = z.object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    dateOfBirth: z.date().nullable(),
    description: z.string().max(500, "La description ne doit pas dépasser 500 caractères").optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function ProfileComponent({ userId, userData }: { userId: string; userData: IUser | null }) {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        firstName: userData?.first_name || '',
        lastName: userData?.last_name || '',
        email: userData?.email || '',
        dateOfBirth: userData?.date_of_birth ? new Date(userData.date_of_birth) : null,
        description: userData?.description || '',
    });
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                email: userData.email || '',
                dateOfBirth: userData.date_of_birth ? new Date(userData.date_of_birth) : null,
                description: userData.description || '',
            });
        }
    }, [userData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date: Date | null) => {
        setFormData({ ...formData, dateOfBirth: date });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            userSchema.parse(formData);

            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'dateOfBirth' && value instanceof Date) {
                        formDataToSend.append(key, value.toISOString());
                    } else {
                        formDataToSend.append(key, value.toString());
                    }
                }
            });

            if (fileInputRef.current?.files?.[0]) {
                formDataToSend.append('profile_picture', fileInputRef.current.files[0]);
            }

            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                body: formDataToSend,
            });

            if (!response.ok) throw new Error('Échec de la mise à jour du profil');

            const updatedUser = await response.json();


            await update({
                ...session,
                user: {
                    ...session?.user,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    email: updatedUser.email,
                    image: updatedUser.profile_picture,
                }
            });

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError(error.errors[0].message);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Une erreur inattendue s'est produite");
            }
        }
    };

    const handleDelete = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            try {
                const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
                if (response.ok) {
                    await signOut({ callbackUrl: '/' });
                } else {
                    throw new Error('Échec de la suppression du compte');
                }
            } catch (error) {
                setError("Échec de la suppression du compte");
            }
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center space-y-4 pt-6">
                <Avatar className="w-24 h-24 border-4 border-white">
                    <AvatarImage src={session?.user.image || ""} alt="Profile" />
                    <AvatarFallback>{formData.firstName[0]}{formData.lastName[0]}</AvatarFallback>
                </Avatar>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {isEditing ? (
                        <>
                            <div>
                                <Label htmlFor="profilePicture">Photo de profil</Label>
                                <Input
                                    id="profilePicture"
                                    name="profile_picture"
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                />
                            </div>
                            <div>
                                <Label htmlFor="firstName">Prénom</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Prénom"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Nom</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Nom"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dateOfBirth">Date de naissance</Label>
                                <DatePicker
                                    id="dateOfBirth"
                                    selected={formData.dateOfBirth}
                                    onChange={handleDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Date de naissance"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Description"
                                    className="h-24"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>
                            <p className="text-gray-600">{formData.email}</p>
                            <p className="text-gray-600">{formData.dateOfBirth?.toLocaleDateString()}</p>
                            <p className="text-gray-700 mt-4">{formData.description || "Aucune description"}</p>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex space-x-2">
                        {isEditing ? (
                            <>
                                <Button type="submit" className="flex-1">Sauvegarder</Button>
                                <Button onClick={() => setIsEditing(false)} className="flex-1" variant="outline">Annuler</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="flex-1">
                                <PencilIcon className="h-5 w-5 mr-2" />
                                Modifier
                            </Button>
                        )}
                        <Button onClick={handleDelete} variant="destructive" className="flex-1">
                            <TrashIcon className="h-5 w-5 mr-2" />
                            Supprimer
                        </Button>
                    </div>
                </form>

                {userData?.totalRevenue && Number(userData.totalRevenue) > 0 && (
                    <p className="font-semibold">Revenu total: {Number(userData.totalRevenue).toFixed(2)} €</p>
                )}
            </CardContent>
        </Card>
    );
}