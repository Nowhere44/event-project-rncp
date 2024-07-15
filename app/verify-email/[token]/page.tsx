'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const router = useRouter();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/verify-email?token=${params.token}`);
                if (response.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error("Erreur lors de la vérification de l'email:", error);
                setStatus('error');
            }
        };

        verifyEmail();
    }, [params.token]);

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">
                    {status === 'success' ? 'Email vérifié avec succès !' : 'Erreur de vérification'}
                </h1>
                <p className="mb-6">
                    {status === 'success'
                        ? 'Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter à votre compte.'
                        : 'Une erreur est survenue lors de la vérification de votre email. Veuillez réessayer ou contacter le support.'}
                </p>
                <Button
                    onClick={() => router.push('/login')}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                >
                    {status === 'success' ? 'Aller à la page de connexion' : `Retour à l'accueil`}
                </Button>
            </div>
        </div>
    );
}