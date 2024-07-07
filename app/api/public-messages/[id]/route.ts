//api/public-messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { updatePublicMessage, deletePublicMessage } from '@/actions';
import { pusherServer } from '@/lib/pusher';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { content } = await request.json();
        const updatedMessage = await updatePublicMessage(params.id, content);
        await pusherServer.trigger('chat', 'editMessage', {
            ...updatedMessage,
            sender: { id: session.user.id, first_name: session.user.firstName },
            senderId: session.user.id
        });
        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error('Error updating public message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const deletedMessage = await deletePublicMessage(params.id);
        if (!deletedMessage) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }
        await pusherServer.trigger('chat', 'deleteMessage', params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting public message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}