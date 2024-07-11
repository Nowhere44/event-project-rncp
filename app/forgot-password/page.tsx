"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Un e-mail de réinitialisation a été envoyé si l'adresse existe.");
                router.push("/login");
            } else {
                setMessage(data.error || "Une erreur est survenue");
            }
        } catch (error) {
            setMessage("Une erreur est survenue");
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <div className="mx-auto grid w-[350px] gap-6">
                <h1 className="text-3xl font-bold text-center">Mot de passe oublié</h1>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button variant="destructive" type="submit">Réinitialiser le mot de passe</Button>
                </form>
                {message && <p className="text-center">{message}</p>}
            </div>
        </div>

    );
}