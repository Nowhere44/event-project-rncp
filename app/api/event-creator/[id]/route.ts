// app/api/event-creator/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '../../../../actions/users/read';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUserById(params.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}