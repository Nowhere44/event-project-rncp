'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const registerSchema = z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse email invalide"),
    password: z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
        .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
    dateOfBirth: z.date().optional(),
    description: z.string().max(500, "La description ne doit pas dépasser 500 caractères").optional(),
});

export default function RegisterForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            registerSchema.parse({
                firstName,
                lastName,
                email,
                password,
                dateOfBirth,
                description
            });

            const formData = new FormData();
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('email', email);
            formData.append('password', password);
            if (dateOfBirth) formData.append('date_of_birth', dateOfBirth.toISOString());
            if (description) formData.append('description', description);

            if (fileInputRef.current?.files?.[0]) {
                formData.append('profile_picture', fileInputRef.current.files[0]);
            } else if (profilePictureUrl) {
                formData.append('profile_picture_url', profilePictureUrl);
            }

            const response = await fetch('/api/users', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                router.push('/login');
            } else {
                const data = await response.json();
                setErrors({ form: data.error || 'Une erreur est survenue lors de l\'inscription' });
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                setErrors({ form: 'Une erreur est survenue lors de l\'inscription' });
            }
        }
    };

    return (
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Inscription</h1>
                <p className="text-balance text-muted-foreground">
                    Créez votre compte pour accéder à toutes nos fonctionnalités
                </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
                <div className="grid gap-2 -ml-4 w-[350px]">
                    <Label htmlFor="dateOfBirth" className='ml-4'>Date de naissance</Label>
                    <DatePicker
                        selected={dateOfBirth}
                        onChange={(date) => setDateOfBirth(date)}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        placeholderText="Sélectionnez votre date de naissance"
                        className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm ml-4">{errors.dateOfBirth}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">À propos de vous (optionnel)</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Parlez-nous un peu de vous..."
                        className="h-24"
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="profilePicture">Photo de profil</Label>
                    <Input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                    />
                    <p className="text-sm text-muted-foreground">ou</p>
                    <Input
                        id="profilePictureUrl"
                        type="url"
                        value={profilePictureUrl}
                        onChange={(e) => setProfilePictureUrl(e.target.value)}
                        placeholder="https://exemple.com/photo.jpg"
                    />
                </div>
                {errors.form && <p className="text-red-500 text-center">{errors.form}</p>}
                <Button type="submit" className="w-full">
                    {` S'inscrire`}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Déjà un compte ?{" "}
                <Link href="/login" className="underline">
                    Se connecter
                </Link>
            </div>
        </div>
    );
}