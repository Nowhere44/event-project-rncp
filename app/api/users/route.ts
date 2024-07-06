//api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getAllUsers } from '@/actions/users/read';
import { createUser } from '@/actions/users/create';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";

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

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const users = await getAllUsers();
        if (!users) {
            return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
        }
        return NextResponse.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}