'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });
            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                router.push(`/profile/${session?.user?.id}`);
            }
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setError('Une erreur est survenue lors de la connexion');
        }
    };

    if (status === 'loading') {
        return <div>Chargement...</div>;
    }

    if (status === 'authenticated') {
        router.push(`/profile/${session?.user?.id}`);
        return null;
    }

    return (
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Connexion</h1>
                <p className="text-balance text-muted-foreground">
                    Entrez votre email ci-dessous pour vous connecter à votre compte
                </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Mot de passe</Label>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <Button type="submit" className="w-full">
                    Se connecter
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                {`Vous n'avez pas de compte ?`}{" "}
                <Link href="/register" className="underline">
                    {`S'inscrire`}
                </Link>
            </div>
        </div>
    );
}