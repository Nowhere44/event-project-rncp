'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type ReservationFormProps = {
    eventId: string;
    price: number | null;
    availableTickets: number;
    isPaid: boolean;
};

const ReservationForm: React.FC<ReservationFormProps> = ({ eventId, price, availableTickets, isPaid }) => {
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const { data: session } = useSession();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    numberOfTickets,
                }),
            });

            if (response.ok) {
                const reservation = await response.json();
                if (isPaid) {
                    router.push(`/payment/${reservation.id}`);
                } else {
                    router.push(`/reservation/${reservation.id}/success`);
                }
            } else {
                throw new Error('Failed to create reservation');
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Number of tickets:
                <input
                    type="number"
                    min="1"
                    max={availableTickets}
                    value={numberOfTickets}
                    onChange={(e) => setNumberOfTickets(parseInt(e.target.value))}
                />
            </label>
            <p>Total: {isPaid ? `$${(price || 0) * numberOfTickets}` : 'Free'}</p>
            <button type="submit" disabled={availableTickets === 0}>
                Réserver
            </button>
        </form>
    );
};

export default ReservationForm;