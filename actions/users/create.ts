//actions/users/create.ts
"use server";
import { prisma } from "@/server/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from '@/lib/email';

export const createUser = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    profile_picture?: string;
    description?: string;
    role?: Role;
}) => {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const verificationToken = uuidv4();

        const newUser = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                date_of_birth: userData.date_of_birth ? new Date(userData.date_of_birth) : undefined,
                verificationToken,
                emailVerified: false,
            },
        });

        await sendVerificationEmail(newUser.email, verificationToken);

        return newUser;
    } catch (error) {
        console.error("error creating user:", error);
        return null;
    }
};