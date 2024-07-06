"use server";
import { prisma } from "@/server/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

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