//app/payment/[reversationId]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export default function PaymentPage({ params }: { params: { reservationId: string } }) {
    const [reservation, setReservation] = useState<any>(null);
    const [existingRating, setExistingRating] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReservation = async () => {
            const response = await fetch(`/api/reservations/${params.reservationId}`);
            if (response.ok) {
                const data = await response.json();
                setReservation(data);
                setExistingRating(data.existingRating);
            } else {
                router.push('/');
            }
        };
        fetchReservation();
    }, [params.reservationId, router]);

    const handlePayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) {
            console.error('Stripe not loaded');
            return;
        }

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId: params.reservationId }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const session = await response.json();

            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Une erreur est survenue lors du paiement. Veuillez réessayer.');
        }
    };

    if (!reservation) return <div>Chargement...</div>;

    return (
        <div>
            <h1>Paiement pour la réservation</h1>
            <p>Événement : {reservation.event.title}</p>
            <p>Nombre de tickets pour cette réservation : {reservation.numberOfTickets}</p>
            <p>Montant à payer : €{Number(reservation.totalAmount).toFixed(2)}</p>
            {existingRating && (
                <div>
                    <h2>Votre évaluation précédente pour cet événement :</h2>
                    <p>Note : {existingRating.rating}/5</p>
                    {existingRating.comment && <p>Commentaire : {existingRating.comment}</p>}
                </div>
            )}
            <button onClick={handlePayment}>Payer avec Stripe</button>
        </div>
    );
}