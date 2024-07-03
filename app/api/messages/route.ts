//app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { content, type, userId } = await request.json();
        const newMessage = await prisma.message.create({
            data: {
                content,
                type,
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                    }
                }
            }
        });
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}