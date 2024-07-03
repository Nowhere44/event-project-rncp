// app/payment/success/page.tsx
"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyPayment } from '@/actions/payment';
import Link from 'next/link';

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
        return <div>Vérification du paiement en cours...</div>;
    }

    if (status === 'error') {
        return <div>Une erreur est survenue lors de la confirmation de votre paiement.</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-4">Paiement réussi</h1>
            <p className="mb-4">Votre réservation pour l'événement "{eventDetails.title}" a été confirmée.</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p><strong>Nombre de tickets :</strong> {eventDetails.numberOfTickets}</p>
                <p><strong>Montant total payé :</strong> {Number(eventDetails.totalAmount).toFixed(2)} €</p>
                {eventDetails.appliedPromoCode && (
                    <p><strong>Code promo appliqué :</strong> {eventDetails.appliedPromoCode} ({eventDetails.discount}% de réduction)</p>
                )}
                <p><strong>Date de l'événement :</strong> {new Date(eventDetails.eventDate).toLocaleDateString()}</p>
            </div>
            <Link href={`/events/${eventDetails.eventId}`} className="text-blue-500 hover:underline">
                Voir les détails de l'événement
            </Link>
        </div>
    );
}