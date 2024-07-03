// app/reservations/[id]/page.tsx

'use client'
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { IReservation, IRating } from '@/types';
import CommentForm from '@/components/CommentForm';
import CancelReservationForm from '@/components/CancelReservationForm';
import { format, differenceInHours, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReservationDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [reservation, setReservation] = useState<IReservation | null>(null);
    const [userRating, setUserRating] = useState<IRating | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReservationAndRating = useCallback(async () => {
        try {
            const reservationResponse = await fetch(`/api/reservations/${id}`);
            if (reservationResponse.ok) {
                const reservationData: IReservation = await reservationResponse.json();
                setReservation(reservationData);
                if (reservationData.event) {
                    const ratingResponse = await fetch(`/api/ratings/event/${reservationData.event.id}`);
                    if (ratingResponse.ok) {
                        const ratingData = await ratingResponse.json();
                        setUserRating(ratingData);
                    }
                }
            } else {
                const errorText = await reservationResponse.text();
                setError(`Erreur lors de la récupération de la réservation: ${errorText}`);
            }
        } catch (error) {
            console.error('Error fetching reservation and rating:', error);
            setError('Une erreur est survenue lors de la récupération des données');
        }
    }, [id]);

    useEffect(() => {
        fetchReservationAndRating();
    }, [fetchReservationAndRating]);

    const handleCommentSubmit = async (rating: number, comment: string) => {
        if (!reservation || isEventPassed()) return;

        try {
            const response = await fetch(`/api/ratings/event/${reservation.eventId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating, comment }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit rating');
            }

            const updatedRating: IRating = await response.json();
            setUserRating(updatedRating);
        } catch (error) {
            console.error('Error submitting rating:', error);
            setError('Une erreur est survenue lors de la soumission de l\'évaluation');
        }
    };

    const handleEditClick = () => {
        if (!isEventPassed()) {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleUpdateRating = async (rating: number, comment: string) => {
        if (!reservation || isEventPassed()) return;

        try {
            const response = await fetch(`/api/ratings/event/${reservation.eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating, comment }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update rating');
            }

            const updatedRating: IRating = await response.json();
            setUserRating(updatedRating);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating rating:', error);
            setError('Une erreur est survenue lors de la mise à jour de l\'évaluation');
        }
    };

    const handleDeleteRating = async () => {
        if (!reservation || isEventPassed()) return;

        try {
            const response = await fetch(`/api/ratings/event/${reservation.eventId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete rating');
            }

            setUserRating(null);
        } catch (error) {
            console.error('Error deleting rating:', error);
            setError('Une erreur est survenue lors de la suppression de l\'évaluation');
        }
    };

    const formatDate = (date: string | Date | undefined) => {
        if (!date) return 'Date non disponible';
        return format(new Date(date), "d MMMM yyyy 'à' HH:mm", { locale: fr });
    };

    const isEventPassed = () => {
        if (!reservation || !reservation.event) return true;
        return isBefore(new Date(reservation.event.event_date), new Date());
    };

    const canCancelReservation = () => {
        if (!reservation || !reservation.event) return false;
        const hoursDifference = differenceInHours(
            new Date(reservation.event.event_date),
            new Date()
        );
        return hoursDifference >= 24;
    };

    if (error) return <div>Erreur: {error}</div>;
    if (!reservation) return <div>Chargement...</div>;

    console.log('Reservation:', reservation);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Détails de la Réservation</h1>
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">{reservation?.event?.title}</h2>
                <p>Date : {formatDate(reservation?.event?.event_date)}</p>
                <p>Nombre de tickets : {reservation?.numberOfTickets}</p>
                <p>Total : {Number(reservation?.totalAmount || 0).toFixed(2)} €</p>
                {canCancelReservation() && (
                    <CancelReservationForm
                        reservationId={reservation?.id || ''}
                        totalTickets={reservation?.numberOfTickets || 0}
                        onCancel={fetchReservationAndRating}
                        eventDate={new Date(reservation?.event?.event_date || '')}
                    />
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Votre avis</h3>
                {isEventPassed() ? (
                    userRating ? (
                        <div>
                            <p>Votre note : {userRating.rating}/5</p>
                            <p>Votre commentaire : {userRating.comment}</p>
                        </div>
                    ) : (
                        <p>L'événement est terminé. Vous ne pouvez plus laisser d'avis.</p>
                    )
                ) : userRating && !isEditing ? (
                    <div>
                        <p>Votre note : {userRating.rating}/5</p>
                        <p>Votre commentaire : {userRating.comment}</p>
                        <button onClick={handleEditClick}>Modifier</button>
                        <button onClick={handleDeleteRating}>Supprimer</button>
                    </div>
                ) : (
                    <CommentForm
                        onSubmit={isEditing ? handleUpdateRating : handleCommentSubmit}
                        initialRating={userRating?.rating}
                        initialComment={userRating?.comment}
                        onCancel={isEditing ? handleCancelEdit : undefined}
                    />
                )}
            </div>
        </div>
    );
}