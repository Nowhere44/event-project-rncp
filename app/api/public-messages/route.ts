import { NextRequest, NextResponse } from 'next/server';
import { getPublicMessages, createPublicMessage } from '@/actions';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { pusherServer } from '@/lib/pusher';

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
        const { content, type } = await request.json();
        const newMessage = await createPublicMessage(content, session.user.id, type);
        await pusherServer.trigger('chat', 'message', {
            ...newMessage,
            sender: { id: session.user.id, first_name: session.user.firstName },
            senderId: session.user.id
        });
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error('Error creating public message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}