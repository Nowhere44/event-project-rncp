//route.ts
export const publicRoutes = [
    "/",
    "/events",
    "/events/*",
    "/forgot-password",
    "/reset-password/*",
    "/verify-email/*",
]

export const authRoutes = [
    "/login",
    "/register",
]

export const apiAuthPrefix = "/api/auth"

export const DEFAULT_LOGIN_REDIRECTION = "/"