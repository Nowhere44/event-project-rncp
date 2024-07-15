//api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getAllUsers } from '@/actions/users/read';
import { createUser } from '@/actions/users/create';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { uploadToS3 } from '@/lib/s3Upload';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const first_name = formData.get('first_name') as string;
        const last_name = formData.get('last_name') as string;
        const date_of_birth = formData.get('date_of_birth') as string;
        const description = formData.get('description') as string;
        const profilePicture = formData.get('profile_picture') as File | null;
        const profilePictureUrl = formData.get('profile_picture_url') as string;

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        let profile_picture = profilePictureUrl;
        if (profilePicture) {
            profile_picture = await uploadToS3(profilePicture);
        }

        const newUser = await createUser({
            email,
            password,
            first_name,
            last_name,
            date_of_birth,
            profile_picture,
            description
        });
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