// app/api/private-messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createPrivateMessage, getPrivateMessages } from '@/actions';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get('otherUserId');

    if (!otherUserId) {
        return NextResponse.json({ error: 'otherUserId is required' }, { status: 400 });
    }

    try {
        const messages = await getPrivateMessages(session.user.id, otherUserId);
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching private messages:', error);
        return NextResponse.json({ error: 'Error fetching private messages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { receiverId, content } = await request.json();
        const newMessage = await createPrivateMessage(session.user.id, receiverId, content);
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error('Error creating private message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}