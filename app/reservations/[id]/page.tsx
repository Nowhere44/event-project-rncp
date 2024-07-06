'use client'
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { IReservation, IRating } from '@/types';
import CommentForm from '@/components/CommentForm';
import CancelReservationForm from '@/components/CancelReservationForm';
import { format, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, TicketIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'

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
        if (!reservation) return;

        try {
            const response = await fetch(`/api/ratings/event/${reservation.eventId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const handleUpdateRating = async (rating: number, comment: string) => {
        if (!reservation) return;

        try {
            const response = await fetch(`/api/ratings/event/${reservation.eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
        if (!reservation) return;

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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Détails de la Réservation</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CalendarIcon className="w-6 h-6 mr-2" />
                            {reservation?.event?.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reservation?.event?.imageUrl && (
                            <img
                                src={reservation.event.imageUrl}
                                alt={reservation.event.title}
                                className="w-full h-48 object-cover rounded-md mb-4"
                            />
                        )}
                        <div className="space-y-2">
                            <p className="flex items-center">
                                <CalendarIcon className="w-5 h-5 mr-2" />
                                {formatDate(reservation?.event?.event_date)}
                            </p>
                            <p className="flex items-center">
                                <TicketIcon className="w-5 h-5 mr-2" />
                                {reservation?.numberOfTickets} ticket(s)
                            </p>
                            <p className="flex items-center">
                                <CurrencyEuroIcon className="w-5 h-5 mr-2" />
                                {Number(reservation?.totalAmount || 0).toFixed(2)} €
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {canCancelReservation() && (
                            <CancelReservationForm
                                reservationId={reservation?.id || ''}
                                totalTickets={reservation?.numberOfTickets || 0}
                                onCancel={fetchReservationAndRating}
                                eventDate={new Date(reservation?.event?.event_date || '')}
                            />
                        )}
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Votre avis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userRating && !isEditing ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p><span className="font-medium">Votre note :</span> {userRating.rating}/5</p>
                                    <p><span className="font-medium">Votre commentaire :</span> {userRating.comment}</p>
                                </div>
                                <div className="space-x-2">
                                    <Button onClick={() => setIsEditing(true)}>Modifier</Button>
                                    <Button variant="destructive" onClick={handleDeleteRating}>Supprimer</Button>
                                </div>
                            </div>
                        ) : (
                            <CommentForm
                                onSubmit={isEditing ? handleUpdateRating : handleCommentSubmit}
                                initialRating={userRating?.rating}
                                initialComment={userRating?.comment}
                                onCancel={isEditing ? () => setIsEditing(false) : undefined}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}