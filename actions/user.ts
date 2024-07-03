//actions/user.ts
"use server";
import { prisma } from "@/server/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { ReservationStatus, PaymentStatus } from "@prisma/client";



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

export const deleteUser = async (id: string): Promise<boolean> => {
    try {
        // Commencer une transaction
        await prisma.$transaction(async (prisma) => {
            // Récupérer les événements de l'utilisateur
            const userEvents = await prisma.event.findMany({
                where: { userId: id },
                select: { id: true }
            });

            const eventIds = userEvents.map(event => event.id);

            // Supprimer les codes promo associés aux événements de l'utilisateur
            await prisma.promoCode.deleteMany({
                where: { eventId: { in: eventIds } }
            });

            // Supprimer les réservations associées aux événements de l'utilisateur
            await prisma.reservation.deleteMany({
                where: { eventId: { in: eventIds } }
            });

            // Supprimer les événements de l'utilisateur
            await prisma.event.deleteMany({
                where: { userId: id }
            });

            // Supprimer les réservations faites par l'utilisateur
            await prisma.reservation.deleteMany({
                where: { userId: id }
            });

            // Supprimer l'utilisateur
            await prisma.user.delete({
                where: { id }
            });
        });

        return true;
    } catch (error) {
        console.error("error deleting user:", error);
        return false;
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
            },
        });
        return users;
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        return null;
    }
};