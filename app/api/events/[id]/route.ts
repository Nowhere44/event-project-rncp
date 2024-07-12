import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { validatePromoCode } from '@/actions';
import { updateEvent } from '@/actions/events/update';
import { getEventById } from '@/actions/events/read';
import { deleteEvent } from '@/actions/events/delete';
import { uploadToS3 } from '@/lib/s3Upload';
import { encrypt, decrypt } from '@/lib/encryption';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const event = await getEventById(params.id);
        if (!event) {
            return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
        }
        return NextResponse.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération de l\'événement' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { promoCode } = await req.json();
        const result = await validatePromoCode(params.id, promoCode);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error validating promo code:', error);
        return NextResponse.json({ error: 'Erreur lors de la validation du code promo sa valeur ne peut pas être superieure à 100%' }, { status: 500 });
    }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const eventData: any = {};

        const fields = ['title', 'description', 'event_date', 'start_time', 'end_time', 'location', 'latitude', 'longitude', 'capacity', 'is_paid', 'price', 'tags', 'isOnline', 'meetingType', 'meetingLink'];

        fields.forEach(field => {
            const value = formData.get(field);
            if (value !== null) {
                if (field === 'tags') {
                    eventData[field] = JSON.parse(value as string);
                } else if (field === 'event_date' || field === 'start_time' || field === 'end_time') {
                    eventData[field] = new Date(value as string);
                } else if (field === 'capacity' || field === 'price') {
                    eventData[field] = Number(value);
                } else if (field === 'is_paid' || field === 'isOnline') {
                    eventData[field] = value === 'true';
                } else if (field === 'latitude' || field === 'longitude') {
                    eventData[field] = value ? parseFloat(value as string) : null;
                } else {
                    eventData[field] = value;
                }
            }
        });

        const existingImageUrls = JSON.parse(formData.get('existingImageUrls') as string || '[]');
        const imageFiles = formData.getAll('imageFile');

        if (eventData.isOnline && eventData.meetingType === 'INTEGRATED' && eventData.meetingLink) {
            eventData.meetingLink = encrypt(eventData.meetingLink);
        }

        const uploadedImages: string[] = [];
        for (const file of imageFiles) {
            if (file instanceof File) {
                const uploadedImageUrl = await uploadToS3(file);
                uploadedImages.push(uploadedImageUrl);
            }
        }

        eventData.images = Array.from(new Set([...existingImageUrls, ...uploadedImages])).slice(0, 5);

        const updatedEvent = await updateEvent(params.id, eventData, session.user.id);
        return NextResponse.json(updatedEvent, { status: 200 });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'événement' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        await deleteEvent(params.id, session.user.id);
        return NextResponse.json({ message: 'Événement supprimé avec succès' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: 'Erreur lors de la suppression de l\'événement' }, { status: 500 });
    }
}