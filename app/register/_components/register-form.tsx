'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function RegisterForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
                    profile_picture: profilePictureUrl,
                }),
            });

            if (response.ok) {
                router.push('/login');
            } else {
                const data = await response.json();
                setError(data.error || 'Une erreur est survenue lors de l\'inscription');
            }
        } catch (error) {
            setError('Une erreur est survenue lors de l\'inscription');
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
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="profilePictureUrl">URL de la photo de profil</Label>
                    <Input
                        id="profilePictureUrl"
                        type="url"
                        value={profilePictureUrl}
                        onChange={(e) => setProfilePictureUrl(e.target.value)}
                        placeholder="https://exemple.com/photo.jpg"
                    />
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <Button type="submit" className="w-full">
                    {`S'inscrire`}
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