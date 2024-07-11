"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword({ params }: { params: { token: string } }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();
    const { token } = params;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas");
            return;
        }
        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Mot de passe réinitialisé avec succès");
                router.push("/login");
            } else {
                setMessage(data.error || "Une erreur est survenue");
            }
        } catch (error) {
            setMessage("Une erreur est survenue");
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <div className="mx-auto grid w-[350px] gap-6">
                <h1 className="text-3xl font-bold text-center">Réinitialiser le mot de passe</h1>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button className="bg-orange-500" type="submit">Réinitialiser le mot de passe</Button>
                </form>
                {message && <p className="text-center">{message}</p>}
            </div>
        </div>
    );
}