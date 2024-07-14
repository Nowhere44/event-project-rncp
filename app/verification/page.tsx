'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Spinner from '@/components/ui/spinner';

export default function VerificationPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const checkVerificationStatus = async () => {
            if (!session) return;

            try {
                const response = await fetch('/api/verification/status');
                const data = await response.json();

                if (data.isVerified) {
                    setIsVerified(true);
                    router.push('/events/create');
                } else if (data.hasPendingRequest) {
                    setHasPendingRequest(true);
                    router.push('/verification/pending');
                } else {
                    setHasPendingRequest(false);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du statut:', error);
                setError('Impossible de vérifier le statut de vérification.');
            }
        };

        checkVerificationStatus();
    }, [session, router]);


    console.log('hasPendingRequest:', hasPendingRequest);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("Le fichier ne doit pas dépasser 5 Mo.");
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        setError(null);
        const formData = new FormData();
        formData.append('idDocument', file);

        try {
            const response = await fetch('/api/verification', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setShowSuccessDialog(true);
                setHasPendingRequest(true);
                setTimeout(() => {
                    setIsRedirecting(true);
                    router.push('/verification/pending');
                }, 100);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la soumission');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la soumission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session) {
        return <div>Veuillez vous connecter pour accéder à cette page.</div>;
    }
    if (isVerified || hasPendingRequest) {
        return null;
    }
    if (isRedirecting) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }


    return (
        <div className="flex justify-center items-center h-full">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{`Vérification d'identité`}</CardTitle>
                    <CardDescription>
                        {`Pour garantir la sécurité de notre communauté, nous avons besoin de vérifier votre identité.
                        Veuillez soumettre un document d'identité officiel (passeport, carte d'identité, permis de conduire).`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hasPendingRequest ? (
                        <Alert>
                            <AlertTitle>Demande en cours</AlertTitle>
                            <AlertDescription>
                                Vous avez déjà une demande de vérification en cours. Veuillez patienter pendant que nous examinons votre document.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700 mb-2">
                                    {`Pièce d'identité (Max 5 Mo - Formats acceptés : JPG, PNG, PDF)`}
                                </label>
                                <Input
                                    id="idDocument"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    required
                                />
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Erreur</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" disabled={isSubmitting || !file || hasPendingRequest} className="w-full bg-orange-500 hover:bg-orange-600">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Soumettre pour vérification'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Demande soumise avec succès</DialogTitle>
                        <DialogDescription>
                            {` Votre demande de vérification a été soumise avec succès. Notre équipe l'examinera dans les plus brefs délais.
                            Vous recevrez un e-mail une fois que votre demande aura été traitée.`}
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => router.push('/')}>{`Retour à l'accueil`}</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}