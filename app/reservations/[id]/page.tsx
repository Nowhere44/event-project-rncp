'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { IReservation } from '@/types';

export default function ReservationDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [reservation, setReservation] = useState<IReservation | null>(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchReservation = async () => {
            const response = await fetch(`/api/reservations/${id}`);
            if (response.ok) {
                const data = await response.json();
                setReservation(data);
            }
        };

        fetchReservation();
    }, [id]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ici, vous implémenterez plus tard la logique pour envoyer le commentaire
        console.log('Commentaire soumis:', comment);
    };

    if (!reservation) return <div>Chargement...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Détails de la Réservation</h1>
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">{reservation.event.title}</h2>
                <p>Date : {new Date(reservation.event.start_time).toLocaleDateString()}</p>
                <p>Nombre de tickets : {reservation.numberOfTickets}</p>
                <p>Total : {reservation.totalAmount} €</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Laisser un commentaire</h3>
                <form onSubmit={handleCommentSubmit}>
                    <textarea
                        className="w-full p-2 border rounded-md"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Votre commentaire..."
                    />
                    <button
                        type="submit"
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Soumettre le commentaire
                    </button>
                </form>
            </div>
        </div>
    );
}