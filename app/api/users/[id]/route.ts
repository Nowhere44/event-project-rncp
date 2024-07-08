// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/actions/users/update';
import { deleteUser } from '@/actions/users/delete';
import { getServerSession } from "next-auth/next";
import { getUserById } from '@/actions/users/read';
import { authOptions } from "@/auth.config";
import { revalidatePath } from "next/cache";
import { writeFile } from 'fs/promises';
import path from 'path';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.id !== params.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const userData: any = {
            first_name: formData.get('firstName') as string,
            last_name: formData.get('lastName') as string,
            email: formData.get('email') as string,
            date_of_birth: formData.get('dateOfBirth') ? new Date(formData.get('dateOfBirth') as string) : undefined,
            description: formData.get('description') as string,
        };

        const profilePicture = formData.get('profile_picture') as File | null;
        if (profilePicture) {
            const bytes = await profilePicture.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Créer un nom de fichier unique
            const fileName = `${Date.now()}-${profilePicture.name}`;
            const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

            // Écrire le fichier
            await writeFile(filePath, buffer);

            // Mettre à jour l'URL de l'image de profil
            userData.profile_picture = `/uploads/${fileName}`;
        }

        const updatedUser = await updateUser(params.id, userData);
        if (!updatedUser) {
            return NextResponse.json({ error: "Failed to update user" }, { status: 400 });
        }

        revalidatePath(`/profile/${params.id}`);
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.id !== params.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const success = await deleteUser(params.id);
        if (success) {
            return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Failed to delete user" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.id !== params.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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