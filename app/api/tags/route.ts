//app/api/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createTag, getTags } from '@/actions';

export async function GET() {
    try {
        const tags = await getTags();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ message: 'Error fetching tags' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();
        const newTag = await createTag(name);
        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ message: 'Error creating tag' }, { status: 500 });
    }
}