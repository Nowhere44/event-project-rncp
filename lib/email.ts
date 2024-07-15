//lib/email.ts
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


export async function sendVerificationStatusEmail(to: string, status: string) {
    let subject, text;

    if (status === 'APPROVED') {
        subject = 'Votre compte a été vérifié';
        text = 'Félicitations ! Votre compte a été vérifié avec succès. Vous pouvez maintenant créer des événements sur notre plateforme.';
    } else if (status === 'REJECTED') {
        subject = 'Votre demande de vérification a été rejetée';
        text = 'Malheureusement, votre demande de vérification a été rejetée. Veuillez vous assurer que votre document d\'identité est clairement lisible et réessayez.';
    } else {
        subject = 'Mise à jour de votre demande de vérification';
        text = 'Il y a eu une mise à jour concernant votre demande de vérification. Veuillez vous connecter à votre compte pour plus de détails.';
    }

    await transporter.sendMail({
        from: '"Votre Service d\'Événements" <noreply@votreservice.com>',
        to,
        subject,
        text,
    });
}

export async function sendAdminNotificationEmail() {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.error('Email d\'administrateur non configuré');
        return;
    }

    try {
        await transporter.sendMail({
            from: '"Système de Vérification" <noreply@votreservice.com>',
            to: adminEmail,
            subject: 'Nouvelle demande de vérification',
            text: 'Une nouvelle demande de vérification a été soumise. Veuillez vous connecter au panneau d\'administration pour l\'examiner.',
        });
        console.log('Email admin envoyé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email admin:', error);
    }
}

export async function sendVerificationEmail(to: string, token: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`;
    await transporter.sendMail({
        from: '"Votre Service d\'Événements" <noreply@votreservice.com>',
        to: to,
        subject: "Vérifiez votre adresse email",
        text: `Bienvenue ! Pour vérifier votre adresse email, veuillez cliquer sur le lien suivant : ${verificationUrl}`,
        html: `
            <h1>Bienvenue sur notre plateforme !</h1>
            <p>Pour vérifier votre adresse email, veuillez cliquer sur le lien ci-dessous :</p>
            <a href="${verificationUrl}">Vérifier mon adresse email</a>
        `,
    });
}