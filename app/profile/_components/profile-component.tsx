'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { IUser } from '@/types';
import { PencilIcon, TrashIcon, EnvelopeIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Spinner from "@/components/ui/spinner";
import { CheckCircle } from 'lucide-react';

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
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: null,
        description: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
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
            setPreviewImage(userData.profile_picture || null);
            setIsLoading(false);
        }
    }, [userData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date: Date | null) => {
        setFormData({ ...formData, dateOfBirth: date });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <CardContent className="flex flex-col items-center space-y-6 p-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-orange-500">
                                <AvatarImage src={previewImage || session?.user.image || ""} alt="Profile" />
                                <AvatarFallback className="bg-orange-100 text-orange-500 text-2xl">
                                    {formData.firstName[0]}{formData.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            {userData?.isVerified && (
                                <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                            )}
                            {isEditing && (
                                <label htmlFor="profilePicture" className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer">
                                    <PencilIcon className="h-5 w-5" />
                                    <input
                                        id="profilePicture"
                                        name="profile_picture"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            {isEditing ? (
                                <>
                                    <div>
                                        <Label htmlFor="firstName" className="text-gray-700 flex items-center">
                                            <UserIcon className="h-5 w-5 mr-2 text-orange-500" />
                                            Prénom
                                        </Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Prénom"
                                            className="border-orange-200 focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName" className="text-gray-700 flex items-center">
                                            <UserIcon className="h-5 w-5 mr-2 text-orange-500" />
                                            Nom
                                        </Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Nom"
                                            className="border-orange-200 focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-gray-700 flex items-center">
                                            <EnvelopeIcon className="h-5 w-5 mr-2 text-orange-500" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Email"
                                            className="border-orange-200 focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dateOfBirth" className="text-gray-700 flex items-center">
                                            <CalendarIcon className="h-5 w-5 mr-2 text-orange-500" />
                                            Date de naissance
                                        </Label>
                                        <div className="datepicker-container w-full -ml-4">
                                            <DatePicker
                                                id="dateOfBirth"
                                                selected={formData.dateOfBirth}
                                                onChange={handleDateChange}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Date de naissance"
                                                className="w-full p-2 border rounded border-orange-200 focus:border-orange-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="text-gray-700 flex items-center">
                                            <PencilIcon className="h-5 w-5 mr-2 text-orange-500" />
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Description"
                                            className="h-24 border-orange-200 focus:border-orange-500"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className='text-gray-600 flex'>
                                        <UserIcon className="h-5 w-5 mr-2 text-orange-500" />
                                        {formData.firstName}  <span className='ml-1 uppercase font-bold'> {formData.lastName}</span>
                                    </div>

                                    <div className="text-gray-600 flex">
                                        <EnvelopeIcon className="h-5 w-5 mr-2 text-orange-500" />
                                        {formData.email}
                                    </div>
                                    <div className="text-gray-600 flex">
                                        <CalendarIcon className="h-5 w-5 mr-2 text-orange-500" />
                                        {formData.dateOfBirth?.toLocaleDateString()}
                                    </div>
                                    <div className='text-gray-600 flex items-center'>
                                        <PencilIcon className="h-5 w-5 mr-2 text-orange-500" />
                                        {formData.description || "Aucune description"}
                                    </div>
                                    <div>
                                        {userData?.totalRevenue && Number(userData.totalRevenue) > 0 && (
                                            <p className="font-semibold text-center">Revenu total sur la plateforme: <span className="text-green-500">{Number(userData.totalRevenue).toFixed(2)} €</span></p>
                                        )}
                                    </div>

                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">Sauvegarder</Button>
                                        <Button variant='outline' onClick={() => setIsEditing(false)} className="flex-1">Annuler</Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                                        <PencilIcon className="h-5 w-5 mr-2" />
                                        Modifier
                                    </Button>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                                            <TrashIcon className="h-5 w-5 mr-2" />
                                            Supprimer
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer votre compte ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                                                Supprimer
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </form>
                    </>
                )}
            </CardContent>
        </Card>
    );
}