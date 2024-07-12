import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendReservationConfirmation(to: string, eventTitle: string, tickets: number, totalAmount: number) {
    await transporter.sendMail({
        from: '"Votre Service d\'Événements" <noreply@votreservice.com>',
        to: to,
        subject: "Confirmation de réservation",
        text: `Votre réservation pour ${eventTitle} (${tickets} ticket(s)) a été confirmée. Montant total : ${totalAmount}€`,
        html: `<p>Votre réservation pour <strong>${eventTitle}</strong> (${tickets} ticket(s)) a été confirmée.</p><p>Montant total : ${totalAmount}€</p>`,
    });
}

export async function sendReservationCancellation(to: string, eventTitle: string, tickets: number) {
    await transporter.sendMail({
        from: '"Votre Service d\'Événements" <noreply@votreservice.com>',
        to: to,
        subject: "Annulation de réservation",
        text: `Votre réservation pour ${eventTitle} (${tickets} ticket(s)) a été annulée.`,
        html: `<p>Votre réservation pour <strong>${eventTitle}</strong> (${tickets} ticket(s)) a été annulée.</p>`,
    });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
        from: '"Votre Service d\'Événements" <noreply@votreservice.com>',
        to: to,
        subject: "Réinitialisation de votre mot de passe",
        text: `Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour procéder : ${resetUrl}\n\nSi vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.\n\nCe lien expirera dans 1 heure.`,
        html: `
            <h1>Réinitialisation de votre mot de passe</h1>
            <p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :</p>
            <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.</p>
            <p>Ce lien expirera dans 1 heure.</p>
        `,
    });
}