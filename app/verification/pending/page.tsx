'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Spinner from '@/components/ui/spinner';

export default function VerificationPendingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (!session) return;

            try {
                const response = await fetch('/api/verification/status');
                const data = await response.json();

                if (data.isVerified) {
                    router.push('/events/create');
                } else if (!data.hasPendingRequest) {
                    router.push('/verification');
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du statut:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [session, router]);

    if (isLoading) {
        return <div className='h-full flex items-center justify-center'><Spinner /></div>;
    }

    if (!session) {
        return <div>Veuillez vous connecter pour accéder à cette page.</div>;
    }

    return (
        <div className="flex items-center h-full justify-center p-4">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Vérification en attente</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        {`Votre demande de vérification a été soumise avec succès. Notre équipe examinera votre document d'identité dans les plus brefs délais.`}
                    </p>
                    <p className="mb-4">
                        Vous recevrez une notification par email une fois que votre demande aura été traitée.
                    </p>
                    <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                        <Link href="/">{`Retour à l'accueil`}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}