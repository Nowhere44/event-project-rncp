//actions/users/read.ts
"use server";
import { prisma } from "@/server/db";
import { Role } from "@prisma/client";

export const getUserById = async (id: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ? {
            ...user,
            role: user.role as Role
        } : null;
    } catch (error) {
        console.error("error fetching user by id", error);
        return null;
    }
};

export const getUserByEmail = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch {
        return null;
    }
};

export const getAllUsers = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                profile_picture: true,
                isVerified: true,
            },
        });
        return users;
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        return null;
    }
};