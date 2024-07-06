//api/public-messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPublicMessages } from '@/actions/publicMessages/read';
import { createPublicMessage } from '@/actions/publicMessages/create';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";

export async function GET() {
    try {
        const messages = await getPublicMessages();
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching public messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { content } = await request.json();
        const newMessage = await createPublicMessage(content, session.user.id);
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error('Error creating public message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
