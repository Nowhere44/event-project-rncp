// app/payment/success/page.tsx
"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyPayment } from '@/actions/payment';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, TicketIcon, CalendarIcon, CurrencyEuroIcon, TagIcon } from '@heroicons/react/24/outline'


export default function PaymentSuccessPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [eventDetails, setEventDetails] = useState<any>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            checkPaymentStatus(sessionId);
        } else {
            setStatus('error');
        }
    }, [searchParams]);

    async function checkPaymentStatus(sessionId: string) {
        try {
            const result = await verifyPayment(sessionId);
            if (result.success) {
                setStatus('success');
                setEventDetails(result.eventDetails);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du paiement:', error);
            setStatus('error');
        }
    }

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen">Vérification du paiement en cours...</div>;
    }

    if (status === 'error') {
        return (
            <div className="container mx-auto py-8 text-center">
                <Card>
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de paiement</h1>
                        <p>Une erreur est survenue lors de la confirmation de votre paiement.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                        <CheckCircleIcon className="w-8 h-8 mr-2" />
                        Paiement réussi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">{`Votre réservation pour l'événement "${eventDetails.title}" a été confirmée.`}</p>
                    <div className="space-y-2">
                        <p className="flex items-center">
                            <TicketIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">Nombre de tickets :</span> {eventDetails.numberOfTickets}
                        </p>
                        <p className="flex items-center">
                            <CurrencyEuroIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">Montant total payé :</span> {Number(eventDetails.totalAmount).toFixed(2)} €
                        </p>
                        {eventDetails.appliedPromoCode && (
                            <p className="flex items-center">
                                <TagIcon className="w-5 h-5 mr-2" />
                                <span className="font-medium">Code promo appliqué :</span>
                                <Badge variant="secondary" className="ml-2">
                                    {eventDetails.appliedPromoCode} ({eventDetails.discount}% de réduction)
                                </Badge>
                            </p>
                        )}
                        <p className="flex items-center">
                            <CalendarIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">{`Date de l'événement :`}</span> {new Date(eventDetails.eventDate).toLocaleDateString()}
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Link href={`/events/${eventDetails.eventId}`}>
                        <Button>{`Voir les détails de l'événement`}</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}