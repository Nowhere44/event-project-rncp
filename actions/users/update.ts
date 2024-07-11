//actions/users/update.ts
"use server";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";
import { Prisma, ReservationStatus, PaymentStatus } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/email";


export const updateUser = async (id: string, userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_picture?: string;
    date_of_birth?: Date;
    description?: string;
}) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: userData,
        });
        revalidatePath(`/profile/${id}`);
        return updatedUser;
    } catch (error) {
        console.error("error updating user:", error);
        return null;
    }
};

export async function updateUserTotalRevenue(userId: string) {
    const userEvents = await prisma.event.findMany({
        where: { userId },
        include: {
            reservations: {
                where: {
                    status: ReservationStatus.Confirmed
                },
                include: {
                    payment: true
                }
            }
        }
    });

    let totalRevenue = 0;

    for (const event of userEvents) {
        for (const reservation of event.reservations) {
            if (reservation.payment && reservation.payment.status === PaymentStatus.Paid) {
                totalRevenue += Number(reservation.totalAmount);
            }
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: { totalRevenue: new Prisma.Decimal(totalRevenue.toFixed(2)) }
    });

    return totalRevenue;
}


export const initializePasswordReset = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { success: true };
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpires = new Date(Date.now() + 3600000);

        await prisma.user.update({
            where: { email },
            data: { resetPasswordToken: resetToken, resetPasswordExpires },
        });

        await sendPasswordResetEmail(email, resetToken);

        return { success: true };
    } catch (error) {
        console.error("Error initializing password reset:", error);
        return { success: false, error: "Une erreur est survenue" };
    }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() },
            },
        });

        if (!user) {
            return { success: false, error: "Token invalide ou expiré" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, error: "Une erreur est survenue" };
    }
};