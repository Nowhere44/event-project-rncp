//auth.config.ts
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { verifyToken } from '@/lib/twoFactor';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Mot de passe", type: "password" },
                twoFactorToken: { label: "Code 2FA", type: "text" }
            },
            async authorize(credentials): Promise<any | null> {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null;
                }
                if (!user.emailVerified) {
                    throw new Error("Email not verified");
                }

                if (user.twoFactorEnabled) {
                    if (!credentials.twoFactorToken) {
                        throw new Error("2FA_REQUIRED");
                    }

                    const isTokenValid = verifyToken(user.twoFactorSecret!, credentials.twoFactorToken);
                    if (!isTokenValid) {
                        throw new Error("INVALID_2FA_TOKEN");
                    }
                }

                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    image: user.profile_picture,
                    isVerified: user.isVerified,
                    emailVerified: user.emailVerified,
                    twoFactorEnabled: user.twoFactorEnabled
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.role = user.role;
                token.image = user.image;
                token.isVerified = user.isVerified;
                token.emailVerified = user.emailVerified ? true : false;
                token.twoFactorEnabled = user.twoFactorEnabled;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
                session.user.role = token.role as Role;
                session.user.image = token.image as string | undefined;
                session.user.isVerified = token.isVerified as boolean;
                session.user.emailVerified = token.emailVerified as boolean;
                session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};