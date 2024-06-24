import NextAuth from "next-auth";
import { authOptions } from "@/auth.config";

export const auth = NextAuth(authOptions);

export const handlers = {
    GET: auth,
    POST: auth,
};

export default auth;