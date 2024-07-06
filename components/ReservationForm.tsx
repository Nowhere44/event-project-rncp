// ReservationForm.tsx
'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';

type ReservationFormProps = {
    eventId: string;
    price: number | null;
    availableTickets: number;
    isPaid: boolean;
    eventDate: string;
};

const ReservationForm: React.FC<ReservationFormProps> = ({ eventId, price, availableTickets, isPaid, eventDate }) => {
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();
    const router = useRouter();
    const [validatedPromoCode, setValidatedPromoCode] = useState<string | null>(null);

    const validatePromoCode = async () => {
        try {
            const response = await fetch(`/api/events/${eventId}/validate-promo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promoCode }),
            });
            const data = await response.json();
            if (response.ok) {
                if (data.discount > 100) {
                    setError('La réduction ne peut pas dépasser 100 %');
                    setDiscount(0);
                    setValidatedPromoCode(null);
                } else {
                    setDiscount(data.discount);
                    setValidatedPromoCode(promoCode);
                    setError(null);
                }
            } else {
                setError(data.error || 'Code promo invalide');
                setDiscount(0);
                setValidatedPromoCode(null);
            }
        } catch (error) {
            console.error('Erreur lors de la validation du code promo:', error);
            setError('Erreur lors de la validation du code promo');
            setDiscount(0);
            setValidatedPromoCode(null);
        }
    };

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
                    promoCode: validatedPromoCode,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                if (data.sessionId) {
                    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
                    if (stripe) {
                        await stripe.redirectToCheckout({ sessionId: data.sessionId });
                    }
                } else {
                    router.push(data.redirectUrl);
                }
            } else {
                throw new Error(data.error || 'Failed to create reservation');
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
            setError('Une erreur est survenue lors de la création de la réservation');
        }
    };

    const totalPrice = isPaid ? (price || 0) * numberOfTickets * (1 - discount / 100) : 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="numberOfTickets" className="block text-sm font-medium text-gray-700">Nombre de tickets:</label>
                <input
                    id="numberOfTickets"
                    type="number"
                    min="1"
                    max={availableTickets}
                    value={numberOfTickets}
                    onChange={(e) => setNumberOfTickets(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            {isPaid && (
                <div>
                    <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700">Code promo:</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="text"
                            id="promoCode"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <Button type="button" onClick={validatePromoCode} className="rounded-none rounded-r-md">
                            Valider
                        </Button>
                    </div>
                </div>
            )}
            <p className="text-lg font-semibold">Total: {isPaid ? `${totalPrice.toFixed(2)} €` : 'Gratuit'}</p>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" disabled={availableTickets === 0}>
                {availableTickets === 0 ? 'Complet' : isPaid ? 'Payer' : 'Réserver'}
            </Button>
        </form>
    );
};

export default ReservationForm;
