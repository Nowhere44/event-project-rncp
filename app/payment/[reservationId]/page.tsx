'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

console.log('Public Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

console.log(stripePromise);
console.log('Public Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
console.log('Secret Key:', process.env.STRIPE_SECRET_KEY);

export default function PaymentPage({ params }: { params: { reservationId: string } }) {
    const [reservation, setReservation] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReservation = async () => {
            const response = await fetch(`/api/reservations/${params.reservationId}`);
            if (response.ok) {
                const data = await response.json();
                setReservation(data);
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
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reservationId: params.reservationId }),
        });
        const session = await response.json();
        if (session.error) {
            console.error('Error:', session.error);
            return;
        }
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });
        if (result.error) {
            alert(result.error.message);
        }
    };

    if (!reservation) return <div>Loading...</div>;

    return (
        <div>
            <h1>Payment for Reservation</h1>
            <p>Event: {reservation.event.title}</p>
            <p>Number of tickets: {reservation.numberOfTickets}</p>
            <p>Total amount: ${reservation.totalAmount}</p>
            <button onClick={handlePayment}>Pay with Stripe</button>
        </div>
    );
}