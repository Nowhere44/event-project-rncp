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