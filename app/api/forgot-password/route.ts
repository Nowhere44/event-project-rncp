import { NextResponse } from "next/server";
import { initializePasswordReset } from "@/actions/users/update";

export async function POST(request: Request) {
    const { email } = await request.json();

    const result = await initializePasswordReset(email);

    if (result.success) {
        return NextResponse.json({ message: "Si l'adresse existe, un e-mail a été envoyé." });
    } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
}