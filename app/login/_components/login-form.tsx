'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [is2FARequired, setIs2FARequired] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccess('Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.');
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            router.push(`/profile/${session.user.id}`);
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
                twoFactorToken: twoFactorToken,
            });

            if (result?.error === "2FA_REQUIRED") {
                setIs2FARequired(true);
                setError("Veuillez entrer votre code 2FA.");
            } else if (result?.error === "INVALID_2FA_TOKEN") {
                setError("Code 2FA invalide. Veuillez réessayer.");
            } else if (result?.error) {
                setError("Email ou mot de passe incorrect.");
            } else if (result?.ok) {
                setIsLoggingIn(true);
                router.push(`/profile/${session?.user?.id}`);
            }
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setError('Une erreur est survenue lors de la connexion');
        }
    };

    if (status === 'loading' || isLoggingIn) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Connexion</h1>
                <p className="text-balance text-muted-foreground">
                    Entrez votre email ci-dessous pour vous connecter à votre compte
                </p>
            </div>
            {success && (
                <Alert>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}
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
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {is2FARequired && (
                    <div className="grid gap-2">
                        <Label htmlFor="twoFactorToken">Code 2FA</Label>
                        <Input
                            id="twoFactorToken"
                            type="text"
                            value={twoFactorToken}
                            onChange={(e) => setTwoFactorToken(e.target.value)}
                            placeholder="Entrez le code à 6 chiffres"
                            required
                        />
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                    {is2FARequired ? 'Vérifier le code 2FA' : 'Se connecter'}
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
