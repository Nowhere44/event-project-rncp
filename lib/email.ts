import nodemailer from 'nodemailer';

// Utilisez ces variables d'environnement dans votre fichier .env
const EMAIL_SERVER = process.env.EMAIL_SERVER;
const EMAIL_FROM = process.env.EMAIL_FROM;

let transporter = nodemailer.createTransport({
    host: EMAIL_SERVER,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function sendReservationConfirmationEmail(reservation: any) {
    await transporter.sendMail({
        from: EMAIL_FROM,
        to: reservation.user.email,
        subject: "Confirmation de réservation",
        text: `Votre réservation pour ${reservation.event.title} a été confirmée.`,
        html: `<b>Votre réservation pour ${reservation.event.title} a été confirmée.</b>`,
    });
}