import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET() {
    try {
        const tags = await prisma.tag.findMany();
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching tags' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();
        const newTag = await prisma.tag.create({ data: { name } });
        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating tag' }, { status: 500 });
    }
}