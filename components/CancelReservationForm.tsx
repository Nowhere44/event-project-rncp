import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CancelReservationFormProps {
    reservationId: string;
    totalTickets: number;
    onCancel: () => void;
    eventDate: Date;
}

const CancelReservationForm: React.FC<CancelReservationFormProps> = ({
    reservationId,
    totalTickets,
    onCancel,
    eventDate
}) => {
    const [ticketsToCancel, setTicketsToCancel] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleCancel = async () => {
        const now = new Date();
        const timeDifference = eventDate.getTime() - now.getTime();
        const hoursDifference = timeDifference / (1000 * 3600);

        if (hoursDifference < 24) {
            setError("Les annulations ne sont plus possibles 24 heures avant le début de l'événement");
            return;
        }

        try {
            const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketsToCancel }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel reservation');
            }

            const result = await response.json();
            if (result.redirect) {
                router.push(result.redirect);
            } else {
                onCancel();
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'annulation');
        }
    };

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Annuler des tickets</h3>
            <div className="flex items-center gap-4">
                <input
                    type="number"
                    min="1"
                    max={totalTickets}
                    value={ticketsToCancel}
                    onChange={(e) => setTicketsToCancel(parseInt(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                />
                <Button onClick={handleCancel}>Annuler les tickets</Button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default CancelReservationForm;