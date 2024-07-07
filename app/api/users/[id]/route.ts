// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/actions/users/update';
import { deleteUser } from '@/actions/users/delete';
import { getServerSession } from "next-auth/next";
import { getUserById } from '@/actions/users/read';
import { authOptions } from "@/auth.config";
import { revalidatePath } from "next/cache";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.id !== params.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const updatedUser = await updateUser(params.id, {
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            profile_picture: body.image,
            date_of_birth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        });
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