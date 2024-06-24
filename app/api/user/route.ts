import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, deleteUser, updateUser } from '@/actions/user';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, first_name, last_name, date_of_birth, profile_picture } = body;

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const newUser = await createUser({ email, password, first_name, last_name, date_of_birth, profile_picture });
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
