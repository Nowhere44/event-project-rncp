"use server";

import { prisma } from "@/server/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { User } from "next-auth";
import { revalidatePath } from "next/cache";


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


export const createUser = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    profile_picture?: string;
    role?: Role;
}) => {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                date_of_birth: userData.date_of_birth ? new Date(userData.date_of_birth) : undefined,
            },
        });
        return newUser;
    } catch (error) {
        console.error("error creating user:", error);
        return null;
    }
};

export const updateUser = async (id: string, userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_picture?: string;
}) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                profile_picture: userData.profile_picture,
            },
        });
        revalidatePath(`/profile/${id}`);
        return updatedUser;
    } catch (error) {
        console.error("error updating user:", error);
        return null;
    }
};

export const deleteUser = async (id: string) => {
    try {
        await prisma.user.delete({ where: { id } });
        return true;
    } catch (error) {
        console.error("error deleting user:", error);
        return false;
    }
};