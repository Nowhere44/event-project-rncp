'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';
import Spinner from '@/components/ui/spinner';

export default function TwoFactorSetup() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [secret, setSecret] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const enable2FA = async () => {
            try {
                const response = await fetch('/api/two-factor/enable', {
                    method: 'POST',
                });
                const data = await response.json();
                if (response.ok) {
                    setSecret(data.secret);
                    setQrCode(data.qrCode);
                } else {
                    setError(data.error || 'Une erreur est survenue');
                }
            } catch (error) {
                setError('Une erreur est survenue');
            }
        };

        enable2FA();
    }, []);

    const verify2FA = async () => {
        try {
            const response = await fetch('/api/two-factor/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('2FA activé avec succès');
                update({ user: { ...session?.user, twoFactorEnabled: true } });
                setTimeout(() => router.push(`/profile/${session?.user?.id}`), 1000);
            } else {
                setError(data.error || 'Code invalide');
            }
        } catch (error) {
            setError('Une erreur est survenue');
        }
    };

    if (!session) {
        return <div className='h-full flex items-center justify-center'>
            <Spinner />
        </div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">{`Configuration de l'authentification à deux facteurs`}</h1>
            <div className="space-y-6">
                {qrCode && (
                    <div className="text-center">
                        <p className="mb-2">{`Scannez ce QR code avec votre application d'authentification :`}</p>
                        <Image src={qrCode} alt="QR Code" width={200} height={200} className="mx-auto" />
                        <p className="mt-2 text-sm bg-gray-100 p-2 rounded break-all">
                            Ou entrez ce code manuellement : <strong>{secret}</strong>
                        </p>
                    </div>
                )}
                <div>
                    <Label htmlFor="token">Entrez le code de vérification :</Label>
                    <Input
                        id="token"
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <Button onClick={verify2FA} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Vérifier et Activer
                </Button>
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}