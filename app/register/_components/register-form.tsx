//app/register/_components/register-form.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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
    dateOfBirth: z.date().max(new Date(), "La date de naissance ne peut pas être dans le futur").optional(),
    description: z.string().max(500, "La description ne doit pas dépasser 500 caractères").optional(),
});

export default function RegisterForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isUrlInput, setIsUrlInput] = useState(false);
    const [profileImage, setProfileImage] = useState<File | string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (isSuccess && countdown === 0) {
            router.push('/login');
        }
        return () => clearTimeout(timer);
    }, [isSuccess, countdown, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            let dateOfBirth;
            if (day && month && year) {
                dateOfBirth = new Date(`${year}-${month}-${day}`);
            }

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

            if (profileImage) {
                if (typeof profileImage === 'string') {
                    formData.append('profile_picture_url', profileImage);
                } else {
                    formData.append('profile_picture', profileImage);
                }
            }

            const response = await fetch('/api/users', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setIsSuccess(true);
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleInputType = () => {
        setIsUrlInput(!isUrlInput);
        setProfileImage(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileImage(e.target.value);
    };

    return (
        <>
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
                    <div className="grid gap-2">
                        <Label>Date de naissance (optionnel)</Label>
                        <div className="flex gap-2">
                            <Select onValueChange={setDay}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue placeholder="Jour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                        <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                                            {day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={setMonth}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue placeholder="Mois" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {new Date(2000, parseInt(month) - 1).toLocaleString('default', { month: 'long' })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={setYear}>
                                <SelectTrigger className="w-[115px]">
                                    <SelectValue placeholder="Année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
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
                        <Label htmlFor="profilePicture">Photo de profil (optionnel)</Label>
                        <div className="flex gap-2">
                            {isUrlInput ? (
                                <Input
                                    type="url"
                                    value={profileImage as string || ''}
                                    onChange={handleUrlChange}
                                    placeholder="https://exemple.com/photo.jpg"
                                    className='w-64'
                                />
                            ) : (
                                <Input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            )}
                            <Button type="button" onClick={toggleInputType} variant="outline">
                                {isUrlInput ? 'Fichier' : 'URL'}
                            </Button>
                        </div>
                    </div>
                    {errors.form && <p className="text-red-500 text-center">{errors.form}</p>}
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                        {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="underline">
                        Se connecter
                    </Link>
                </div>
            </div>
            <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Inscription réussie!</DialogTitle>
                        <DialogDescription>
                            Votre compte a été créé avec succès. Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}