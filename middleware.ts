import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { DEFAULT_LOGIN_REDIRECTION, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isLoggedIn = !!token;

    const { pathname } = req.nextUrl;

    // Permettre les routes API et NextAuth
    if (pathname.startsWith(apiAuthPrefix)) {
        return NextResponse.next();
    }

    // Vérifier si le chemin correspond à une route publique
    const isPublicRoute = publicRoutes.some(route => {
        if (route.includes('*')) {
            const baseRoute = route.replace('*', '');
            return pathname.startsWith(baseRoute);
        }
        return pathname === route;
    });

    console.log("Is public route:", isPublicRoute);  // Ajoutez ce log

    // Rediriger les utilisateurs connectés loin des pages d'authentification
    if (isLoggedIn && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECTION, req.url));
    }

    // Permettre l'accès aux routes publiques et aux routes d'authentification
    if (isPublicRoute || authRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Rediriger les utilisateurs non connectés vers la page de connexion pour les routes protégées
    if (!isLoggedIn) {
        console.log("Redirecting to login");  // Ajoutez ce log
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|svg).*)"],
}