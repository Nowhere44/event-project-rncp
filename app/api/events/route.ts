import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createEvent } from '@/actions';
import { uploadToS3 } from '@/lib/s3Upload';
import { getEvents } from '@/actions/events/read';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
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

        // Gestion des images
        const existingImageUrls = JSON.parse(formData.get('existingImageUrls') as string || '[]');
        const imageFiles = formData.getAll('imageFile');

        const uploadedImages = [];
        for (const file of imageFiles) {
            if (file instanceof File) {
                const uploadedImageUrl = await uploadToS3(file);
                uploadedImages.push(uploadedImageUrl);
            }
        }

        eventData.images = [...existingImageUrls, ...uploadedImages].slice(0, 5);

        const event = await createEvent(eventData, session.user.id);
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Detailed error:', error);
        return NextResponse.json({
            error: 'Erreur lors de la création de l\'événement',
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const params = {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        isPaid: searchParams.get('isPaid') === 'true' ? true : searchParams.get('isPaid') === 'false' ? false : undefined,
        date: searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10')
    };

    try {
        const { events, total, totalPages } = await getEvents(params);
        return NextResponse.json({ events, total, totalPages });
    } catch (error) {
        console.error('Error searching events:', error);
        return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
    }
}