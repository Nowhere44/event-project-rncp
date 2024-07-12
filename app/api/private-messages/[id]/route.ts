import { deletePrivateMessage, updatePrivateMessage } from '@/actions';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { pusherServer } from '@/lib/pusher';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const messageId = params.id;

    try {
        const { receiverId } = await request.json();
        const result = await deletePrivateMessage(messageId, session.user.id);
        if (result.count > 0) {
            await pusherServer.trigger(`private-${receiverId}`, 'deletePrivateMessage', messageId);
            await pusherServer.trigger(`private-${session.user.id}`, 'deletePrivateMessage', messageId);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Message not found or you are not authorized to delete it' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error deleting private message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const messageId = params.id;

    try {
        const { content, receiverId } = await request.json();
        const result = await updatePrivateMessage(messageId, session.user.id, content);
        if (result.count > 0) {
            const updatedMessage = {
                id: messageId,
                content,
                senderId: session.user.id,
            };
            await pusherServer.trigger(`private-${receiverId}`, 'editPrivateMessage', updatedMessage);
            await pusherServer.trigger(`private-${session.user.id}`, 'editPrivateMessage', updatedMessage);
            return NextResponse.json(updatedMessage);
        } else {
            return NextResponse.json({ error: 'Message not found or you are not authorized to edit it' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error updating private message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}