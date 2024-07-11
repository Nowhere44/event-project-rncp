import { NextResponse } from "next/server";
import { resetPassword } from "@/actions/users/update";

export async function POST(request: Request) {
    const { token, password } = await request.json();

    const result = await resetPassword(token, password);

    if (result.success) {
        return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" });
    } else {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }
}